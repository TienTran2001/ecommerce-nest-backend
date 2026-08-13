# Auth Feature — Backlog Plan

> **Epic được đánh số theo THỨ TỰ BUILD.** Làm từ E0 xuống E7: mỗi epic sau dựa trên epic trước.

---

## Quy ước

| Field                     | Ý nghĩa                                                                  |
| ------------------------- | ------------------------------------------------------------------------ |
| **Type**                  | Epic / Story / Enabler (task hạ tầng)                                    |
| **[FE] / [BE] / [FE+BE]** | Story thuộc frontend (Next.js + Better Auth) / backend (NestJS) / cả hai |
| **AC**                    | Acceptance Criteria — viết theo format Given/When/Then                   |
| **Happy path**            | Luồng thành công                                                         |
| **Error paths**           | Nhánh lỗi + hành vi mong đợi                                             |
| **Tech note**             | Cơ chế Better Auth / bảng / endpoint gợi ý                               |
| **Priority**              | P0 (phải có) · P1 (quan trọng) · P2 (có thì tốt)                         |

**Glossary:**

- **Auth authority (Next.js):** nơi Better Auth chạy — xử lý đăng ký/đăng nhập/OAuth/email/session.
- **Resource server (NestJS):** nhận request, **đọc session** để biết user + role, phục vụ dữ liệu.
- **Registered user:** đã đăng ký, có credential (email/password hoặc Google).
- **Anonymous user (guest):** khách chưa đăng ký — Better Auth tạo user thật với cờ `isAnonymous = true`.
- **Link/claim:** khi guest đăng ký/đăng nhập, dữ liệu (giỏ hàng) được chuyển từ user ẩn danh sang tài khoản thật.

---

## Backlog Overview (thứ tự build)

| Epic                                    | Stories                                                                                                    | Priority |
| --------------------------------------- | ---------------------------------------------------------------------------------------------------------- | -------- |
| **E0 — Nền móng & Hạ tầng Auth**        | S0.1 Schema & migration · S0.2 Cấu hình Better Auth · S0.3 Hạ tầng email · S0.4 CORS & cookie cross-origin | P0       |
| **E1 — Đăng ký & xác thực email**       | S1.1 Đăng ký · S1.2 Xác thực email                                                                         | P0       |
| **E2 — Đăng nhập email/password**       | S2.1 Đăng nhập                                                                                             | P0       |
| **E3 — Phiên & nhận diện user**         | S3.1 Duy trì phiên · S3.2 Backend nhận diện user từ session · S3.3 Lấy user hiện tại · S3.4 Đăng xuất      | P0       |
| **E4 — Quên & đặt lại mật khẩu**        | S4.1 Yêu cầu reset · S4.2 Đặt mật khẩu mới                                                                 | P1       |
| **E5 — Đăng nhập Google (OAuth)**       | S5.1 Đăng nhập Google                                                                                      | P0       |
| **E6 — Phân quyền**                     | S6.1 Bảo vệ route theo role · S6.2 Chặn route nhạy cảm ở edge                                              | P0       |
| **E7 — Khách vãng lai & nhận giỏ hàng** | S7.1 Khách ẩn danh · S7.2 Claim giỏ khi đăng nhập · S7.3 Dọn user ẩn danh                                  | P0       |

---

## E0 — Nền móng & Hạ tầng Auth

> **Mục tiêu:** dựng khung để mọi luồng auth chạy được. Đây là các **Enabler (task hạ tầng)** làm TRƯỚC.

### S0.1 — [BE] Schema & migration cho bảng auth (P0, Enabler)

**Story:** _Là_ dev, _tôi cần_ schema các bảng auth được tạo có kiểm soát, _để_ mọi môi trường có DB giống nhau.

**AC:**

- Có bảng `user`, `session`, `account`, `verification` đúng cột & kiểu Better Auth yêu cầu.
- Schema được tạo qua **migration commit vào git** (không auto-sync).
- Chạy `migration:run` → DB giống nhau.

**Error paths:**
| Tình huống | Hành vi mong đợi |
|---|---|
| Thiếu cột Better Auth cần | Đối chiếu bằng `better-auth CLI generate` để bổ sung trước khi chạy |
| Đổi version Better Auth | Ghim version + đối chiếu lại schema |

**Tech note:** migration là nguồn sự thật · `better-auth CLI generate` chỉ để đối chiếu · `id` uuid v7 (cấu hình `generateId`) · nếu dùng naming snake_case → map `fields`. Backend làm chủ schema, config Better Auth (S0.2) viết để khớp.

---

### S0.2 — [FE] Cấu hình Better Auth instance (P0, Enabler)

**Story:** _Là_ dev, _tôi cần_ một Better Auth instance được cấu hình (khớp schema ở S0.1), _để_ các luồng auth có nền tảng để chạy.

**AC:**

- Bật email/password (yêu cầu xác thực email), session, Google provider, các plugin cần thiết (gồm `anonymous`).
- Có route handler cho toàn bộ endpoint auth.
- Cấu hình khớp schema S0.1: `generateId` (uuid v7), `fields` (nếu snake_case).
- Biến môi trường: secret, base URL, DB, Google keys, SMTP.

**Tech note:** `betterAuth({ emailAndPassword, emailVerification, socialProviders.google, session, plugins, secret, baseURL })` · route handler `/api/auth/[...all]` · auth client.

---

### S0.3 — [FE] Hạ tầng gửi email (P0, Enabler)

**Story:** _Là_ dev, _tôi cần_ một dịch vụ gửi email hoạt động, _để_ các luồng sau (xác thực email ở E1, reset mật khẩu ở E4) có sẵn phương tiện gửi.

**AC:**

- Cấu hình SMTP + service gửi được email HTML (gửi thử thành công).

**Error paths:**
| Tình huống | Hành vi mong đợi |
|---|---|
| SMTP lỗi/timeout | Log lỗi, service báo gửi thất bại |

**Tech note:** Nodemailer/SMTP transport. Các callback của Better Auth ở E1/E4 sẽ gọi service này.

---

### S0.4 — [FE+BE] CORS & cookie cross-origin (P0, Enabler)

**Story:** _Là_ dev, _tôi cần_ web và API (khác origin) chia sẻ được phiên, _để_ request có kèm cookie xác thực.

**AC:**

- API bật CORS với `credentials: true` cho origin của web.
- Cookie cấu hình đúng `SameSite`/`Secure`/domain để đi được giữa web và API.

**Error paths:**
| Tình huống | Hành vi mong đợi |
|---|---|
| Cookie không được gửi kèm | Kiểm tra `withCredentials` + `SameSite`/domain |
| Bị CORS chặn | Thêm origin vào whitelist |

**Tech note:** `enableCors({ credentials:true })` · cookie parser · cấu hình cookie domain/sameSite.

---

## E1 — Đăng ký & xác thực email

> **Business requirement:** Người dùng tạo tài khoản bằng email/mật khẩu; **phải xác thực email trước khi đăng nhập** để đảm bảo email có thật.

### S1.1 — [FE] Đăng ký tài khoản (P0)

**Story:** _Là_ khách, _tôi muốn_ đăng ký bằng email và mật khẩu, _để_ có tài khoản cá nhân.

**AC:**

- Given form hợp lệ, When submit, Then tạo user (`emailVerified = false`) và gửi email xác thực.
- Given email đã tồn tại, When submit, Then báo lỗi, không tạo user.
- Given đăng ký thành công, Then chuyển về trang đăng nhập.

**Happy path:**

1. Nhập name, email, password.
2. Tạo user (`emailVerified = false`).
3. Sinh token xác thực → gửi email.
4. Hiển thị "Vui lòng kiểm tra email".

**Error paths:**
| Tình huống | Hành vi mong đợi |
|---|---|
| Email đã tồn tại | Báo lỗi (thông báo trả về từ Better Auth), không tạo user |
| Email sai định dạng | Validate form + DTO (`@IsEmail`), chặn submit |
| Mật khẩu ngắn hơn 8 ký tự | Validate (min 8), chặn submit |

**Tech note:** `signUp.email` · `requireEmailVerification = true` · bảng `user`, `account`, `verification`.

---

### S1.2 — [FE] Xác thực email (P0)

**Story:** _Là_ người vừa đăng ký, _tôi muốn_ bấm link trong email để xác thực, _để_ kích hoạt tài khoản.

**AC:**

- Given token hợp lệ/chưa hết hạn/chưa dùng, When truy cập, Then set `emailVerified = true`, **xóa token** (one-time use), điều hướng trang thành công.
- Given token hết hạn/đã dùng/không hợp lệ, When truy cập, Then báo lỗi + mời thử lại.

**Happy path:**

1. Bấm link xác thực trong email (link do Better Auth cấp, trỏ endpoint verify của Better Auth).
2. Better Auth tra token trong `verification` → hợp lệ.
3. Set `emailVerified = true`, **xóa row verification** (one-time use).
4. Điều hướng "Xác thực thành công".

**Error paths:**
| Tình huống | Hành vi mong đợi |
|---|---|
| Thiếu token trong link | Báo lỗi, mời yêu cầu link mới |
| Token hết hạn | Báo lỗi (hết hạn) + mời thử lại |
| Token đã dùng (bấm lại lần 2) | Báo "Link không hợp lệ / đã sử dụng" |
| Token không hợp lệ | Báo lỗi xác thực, không đổi trạng thái |

**Tech note:** dùng bảng `verification` (one-time use + `expiresIn`); link trỏ về endpoint verify của Better Auth.

---

## E2 — Đăng nhập email/password

### S2.1 — [FE] Đăng nhập (P0)

**Story:** _Là_ user đã có tài khoản, _tôi muốn_ đăng nhập bằng email/mật khẩu, _để_ truy cập tài khoản.

**AC:**

- Given credential đúng & email đã xác thực, When đăng nhập, Then tạo session + set cookie, vào app.
- Given email **chưa xác thực**, When đăng nhập, Then chặn + nhắc xác thực.
- Given credential sai, When đăng nhập, Then báo lỗi.

**Happy path:**

1. Nhập email + password.
2. Đối chiếu credential, kiểm tra `emailVerified`.
3. Tạo `session` + cookie httpOnly.
4. Vào trang chính.

**Error paths:**
| Tình huống | Hành vi mong đợi |
|---|---|
| Sai email/mật khẩu | "Email hoặc mật khẩu không đúng" (thông báo chung) |
| Email chưa verified | Chặn: "Vui lòng xác thực email trước khi đăng nhập" |
| Email sai định dạng / thiếu field | Validate form + DTO, chặn submit |

**Tech note:** `signIn.email` · kiểm tra `emailVerified` · session cookie.

---

## E3 — Phiên & nhận diện user

> **Business requirement:** Giữ phiên giữa các request; **backend (resource server) phải nhận diện được user + role từ session** để phục vụ và bảo vệ dữ liệu.

### S3.1 — [FE] Duy trì phiên (P0)

**Story:** _Là_ user đã đăng nhập, _tôi muốn_ phiên được giữ, _để_ không phải đăng nhập lại liên tục.

**AC:**

- Given đã đăng nhập, When gọi API, Then request mang session hợp lệ.
- Given lỗi xác thực ở tầng API (401), When client nhận mã lỗi, Then xóa token + điều hướng đăng nhập.
- Session gia hạn (sliding) khi hoạt động.

**Error paths:**
| Tình huống | Hành vi mong đợi |
|---|---|
| Nhận 401 ở tầng API | Client xóa token + điều hướng `/auth/signin` |
| Cookie/token thiếu | Coi như chưa đăng nhập |

**Tech note:** session cookie · client gửi kèm `withCredentials` · interceptor xử lý 401.

---

### S3.2 — [BE] Backend nhận diện user từ session (P0)

**Story:** _Là_ resource server, _tôi cần_ đọc session từ request và ra được user + role, _để_ biết ai đang gọi và họ được làm gì.

**AC:**

- Given request mang session hợp lệ, When backend xử lý, Then trích được user (+ role) và gắn vào request.
- Given không có/không hợp lệ/hết hạn, When backend xử lý, Then coi như chưa xác thực (không gắn user).

**Happy path:**

1. Backend đọc thông tin phiên từ request (cookie/token).
2. Xác thực và tra phiên tương ứng.
3. Lấy user + role, gắn vào context request.

**Error paths:**
| Tình huống | Hành vi mong đợi |
|---|---|
| Không có phiên | Không gắn user (coi như ẩn danh/chưa đăng nhập) |
| Phiên hết hạn / user liên kết không tồn tại | Không gắn user |

**Tech note:** service resolve session ở backend (trả `null` khi không hợp lệ) · guard đọc user+role · cầu nối FE(Better Auth) ↔ BE(resource server).

---

### S3.3 — [BE] Lấy user hiện tại (P0)

**Story:** _Là_ client, _tôi muốn_ hỏi "user hiện tại là ai", _để_ hiển thị đúng trạng thái đăng nhập.

**AC:**

- Given đã đăng nhập, When gọi endpoint lấy user hiện tại, Then trả thông tin user.
- Given chưa đăng nhập, Then trả trạng thái chưa xác thực (không lỗi nặng).

**Tech note:** endpoint `/auth/me` (public) · dùng kết quả của S3.2.

---

### S3.4 — [FE] Đăng xuất (P0)

**Story:** _Là_ user, _tôi muốn_ đăng xuất, _để_ kết thúc phiên an toàn.

**AC:**

- Given đã đăng nhập, When đăng xuất, Then xóa session + clear token phía client.

**Error paths:**
| Tình huống | Hành vi mong đợi |
|---|---|
| Session đã hết hạn khi đăng xuất | Vẫn xóa token phía client, coi như đã đăng xuất |

**Tech note:** `signOut` · xóa session + clear token.

---

## E4 — Quên & đặt lại mật khẩu

### S4.1 — [FE] Yêu cầu đặt lại mật khẩu (P1)

**Story:** _Là_ user quên mật khẩu, _tôi muốn_ nhập email để nhận link đặt lại, _để_ lấy lại quyền truy cập.

**AC:**

- Given email hợp lệ, When yêu cầu, Then gửi email chứa link reset (nếu email tồn tại).

**Error paths:**
| Tình huống | Hành vi mong đợi |
|---|---|
| Email sai định dạng | Validate form, chặn submit |
| Gửi email thất bại | Báo "Gửi email thất bại" |

**Tech note:** `requestPasswordReset` · `sendResetPassword` · bảng `verification`.

---

### S4.2 — [FE] Đặt mật khẩu mới (P1)

**Story:** _Là_ user, _tôi muốn_ nhập mật khẩu mới qua link, _để_ đăng nhập lại được.

**AC:**

- Given token hợp lệ & mật khẩu đủ dài, When submit, Then đổi mật khẩu.
- Given token hết hạn/không hợp lệ, When submit, Then báo lỗi + mời yêu cầu lại.

**Happy path:**

1. Bấm link → trang đặt mật khẩu mới.
2. Nhập mật khẩu mới → `resetPassword({ token, newPassword })`.
3. Đổi password.
4. Về đăng nhập.

**Error paths:**
| Tình huống | Hành vi mong đợi |
|---|---|
| Thiếu token trong link | Báo "Token không hợp lệ hoặc đã hết hạn" + link yêu cầu lại |
| Token hết hạn/đã dùng/không hợp lệ | Báo lỗi + yêu cầu lại (token one-time use qua `verification`) |
| Mật khẩu mới ngắn hơn 8 ký tự / không khớp confirm | Validate form (min 8), chặn submit |

**Tech note:** `resetPassword` · bảng `verification`.

---

## E5 — Đăng nhập Google (OAuth)

### S5.1 — [FE] Đăng nhập bằng Google (P0)

**Story:** _Là_ người dùng, _tôi muốn_ đăng nhập bằng Google, _để_ vào app nhanh không cần mật khẩu.

**AC:**

- Given bấm "Đăng nhập Google" & đồng ý ở Google, When quay lại, Then tạo/liên kết user + account (`providerId='google'`), tạo session, vào app.
- Given hủy/lỗi ở Google, When quay lại, Then về trang đăng nhập, không tạo session.

**Happy path:**

1. Bấm "Đăng nhập Google" → màn hình đồng ý Google.
2. Đồng ý → Google trả về callback của Better Auth.
3. Tạo/liên kết `user` + `account`, tạo `session` + cookie.
4. Trang callback lấy session → điều hướng vào app.

**Error paths:**
| Tình huống | Hành vi mong đợi |
|---|---|
| Lỗi khởi tạo OAuth | Báo "Khởi tạo đăng nhập Google thất bại" |
| Callback thất bại / không lấy được user | Điều hướng về `/auth/signin` (có retry lấy session một lần) |

**Tech note:** `signIn.social({ provider:'google' })` · redirect URI = `/api/auth/callback/google` · bảng `account` · trang callback lấy session rồi fetch user.

---

## E6 — Phân quyền (Authorization)

### S6.1 — [BE] Bảo vệ route theo vai trò (P0)

**Story:** _Là_ hệ thống, _tôi muốn_ chỉ đúng vai trò truy cập đúng tài nguyên, _để_ bảo mật.

**AC:**

- Given endpoint yêu cầu đăng nhập nhưng chưa đăng nhập (và không cho khách), Then trả **401**.
- Given đã đăng nhập nhưng không đủ quyền (sai role), Then trả **403**.
- Given endpoint cho phép khách, When user ẩn danh, Then cho truy cập.

**Error paths:**
| Tình huống | Mã trả về |
|---|---|
| Chưa đăng nhập & route không cho khách | 401 |
| Đăng nhập nhưng sai role | 403 |
| Vượt rate limit toàn cục | 429 |
| Đúng role | 200 |

**Tech note:** guard đọc user+role (từ S3.2) · **AuthGuard** throw `UnauthorizedException` (401) khi chưa xác thực · **RolesGuard** throw `ForbiddenException` (403) khi sai role · roles: `admin`, `customer`, `unregistered` · decorator `@RequireRoles(...)`.

---

### S6.2 — [FE] Chặn route nhạy cảm ở edge (proxy.ts) (P1)

**Story:** _Là_ hệ thống, _tôi muốn_ chặn truy cập trang nhạy cảm ngay ở tầng routing (trước khi render), _để_ user chưa đăng nhập không vào được trang cần auth (vd `/account`, `/checkout`).

**AC:**

- Given user chưa đăng nhập, When truy cập route nhạy cảm, Then redirect về `/auth/signin`.
- Given đã đăng nhập, When truy cập, Then cho vào.

**Happy path:**

1. Request tới route nhạy cảm.
2. `proxy.ts` đọc session cookie → hợp lệ → cho qua.
3. Không hợp lệ → redirect `/auth/signin`.

**Error paths:**
| Tình huống | Hành vi mong đợi |
|---|---|
| Cookie session thiếu/không hợp lệ | Redirect `/auth/signin` |

**Tech note:** Next.js 16 **`proxy.ts`** (tên mới của `middleware.ts`) · `matcher` cho các route nhạy cảm · chỉ kiểm **nhẹ** ở edge (sự hiện diện/hợp lệ của cookie session).

> **Lưu ý:** `proxy.ts` là **lớp chặn UX/first-line**, KHÔNG thay thế enforcement thật ở backend (S6.1). Bảo mật thực sự vẫn do guard backend đảm nhiệm; proxy.ts chỉ để không render trang nhạy cảm cho người chưa đăng nhập.

---

## E7 — Khách vãng lai & nhận giỏ hàng (Anonymous)

> **Business requirement:** Khách **không cần đăng nhập vẫn dùng được giỏ hàng**; khi đăng ký/đăng nhập, **giỏ hàng phải đi theo, không mất sản phẩm**. Giải pháp: mỗi khách là **user ẩn danh thật** (Better Auth `anonymous`); khi chuyển đổi thì link sang tài khoản thật.
> **Chuẩn bị sớm (làm ở giai đoạn auth — KHÔNG phụ thuộc cart):** bật plugin `anonymous` trong Better Auth config (S0.1); thêm role `unregistered` vào enum UserRole; guard cho phép role guest (S6.1). Đây là _readiness_, không phải feature.
>
> **(S7.1–S7.3) chỉ chạy KHI module Cart đã tồn tại**, vì danh tính guest chỉ có ý nghĩa khi có giỏ hàng để gắn vào & claim.

### S7.1 — [FE+BE] Khách ẩn danh dùng giỏ hàng (P0)

**Story:** _Là_ khách chưa đăng ký, _tôi muốn_ thêm sản phẩm vào giỏ và giữ được khi quay lại, _để_ mua sắm mà không bị buộc đăng ký.

**AC:**

- Given khách mới chưa có phiên, When bắt đầu thao tác trên route cho phép khách, Then tạo phiên khách + gắn vào request.
- Given khách, When thêm/sửa/xóa sản phẩm, Then giỏ gắn với khách đó.
- Given quay lại trong hạn phiên, Then thấy đúng giỏ cũ.

**Happy path:**

1. Khách vào route cho phép khách chưa đăng nhập → tạo phiên khách (user ẩn danh) + session.
2. Thêm sản phẩm → giỏ (`carts`) gắn với khách.
3. Quay lại → cùng session → cùng giỏ.

**Error paths:**
| Tình huống | Hành vi mong đợi |
|---|---|
| Tạo phiên khách thất bại | Báo lỗi nhẹ; duyệt sản phẩm công khai vẫn hoạt động |
| Thêm sản phẩm vượt tồn kho | Báo "Không đủ tồn kho", không thêm |

**Tech note:** `anonymous` plugin · `signIn.anonymous()` · `carts.user_id` → user ẩn danh · route cho khách gắn role `unregistered`.

---

### S7.2 — [BE] Nhận giỏ hàng khi đăng nhập (Link/Claim) (P0)

**Story:** _Là_ khách có giỏ, _tôi muốn_ khi đăng ký/đăng nhập thì giỏ đi theo, _để_ không phải chọn lại sản phẩm.

**AC:**

- Given khách có giỏ, When đăng ký/đăng nhập, Then chuyển quyền sở hữu giỏ sang tài khoản thật.
- Given tài khoản thật **đã có giỏ**, When link, Then **gộp** hai giỏ (cộng dồn item trùng).

**Happy path:**

1. Khách (đang có giỏ) đăng ký/đăng nhập.
2. Link khách ↔ tài khoản thật → `onLinkAccount` chạy.
3. Chuyển/gộp giỏ sang tài khoản thật.
4. User thấy đúng giỏ, đủ sản phẩm.

**Error paths:**
| Tình huống | Hành vi mong đợi |
|---|---|
| Tài khoản thật đã có giỏ | Gộp item (cộng dồn số lượng trùng) |
| Chuyển/gộp giỏ thất bại | Không mất dữ liệu — báo lỗi/thử lại, không để giỏ dở dang |

**Tech note:** `anonymous.onLinkAccount({ anonymousUser, newUser })` · chuyển/gộp giỏ trong DB.
**Cần chốt chính sách:** hành vi khi "tài khoản đã có giỏ" (gộp / giữ cũ / giữ mới) — product owner quyết.

---

### S7.3 — [BE] Dọn khách/giỏ hàng hết hạn (P1)

**Story:** _Là_ hệ thống, _tôi muốn_ tự dọn dữ liệu khách không hoạt động, _để_ database không phình vô hạn.

**AC:**

- Given giỏ khách quá hạn, When cron chạy, Then xóa giỏ hết hạn (chỉ giỏ của khách, không đụng giỏ user thật).
- Given user ẩn danh quá hạn & chưa link, When cron chạy, Then xóa user ẩn danh đó (+ giỏ liên quan).

**Error paths:**
| Tình huống | Hành vi mong đợi |
|---|---|
| Xóa nhầm dữ liệu đã link/đã đăng ký | Điều kiện lọc phải loại user thật / giỏ đã claim |
| Cron lỗi giữa chừng | Idempotent, chạy lại được |

**Tech note:** cron dọn định kỳ · dọn giỏ khách quá hạn (`expires_at`) và user ẩn danh quá hạn chưa link · cascade giỏ liên quan.

---

## Non-functional requirements

| NFR               | Yêu cầu                                                                                        |
| ----------------- | ---------------------------------------------------------------------------------------------- |
| **Bảo mật**       | Mật khẩu hash; cookie `httpOnly`+`Secure` (prod).                                              |
| **Rate limiting** | Throttler **toàn cục** → 429 khi vượt ngưỡng (áp cho mọi endpoint, gồm auth).                  |
| **Validation**    | Email đúng định dạng; mật khẩu **tối thiểu 8 ký tự** (đồng bộ FE + BE; chưa kiểm độ phức tạp). |

## Out of scope (giai đoạn này)

- Gửi lại email xác thực.
- Liên kết tài khoản khi email trùng giữa Google và password.
- Rate limit riêng theo endpoint / khóa tài khoản sau nhiều lần sai.
- 2FA / OTP · đăng nhập bằng số điện thoại · social provider ngoài Google.
- Quản lý phiên đa thiết bị.
