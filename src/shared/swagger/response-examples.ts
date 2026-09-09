export const ResEx = {
  auth: {
    verifyEmail: {
      success: true,
      message: 'Email đã được xác minh.',
    },

    me: {
      success: true,
      authenticated: true,
      user: {
        id: 'usr_01',
        email: 'user@example.com',
        name: 'Nguyễn Văn A',
        image: null,
        emailVerified: true,
      },
    },

    session: {
      success: true,
      authenticated: true,
      session: {
        token: 'sess_xxx',
        expiresAt: '2026-04-05T12:00:00.000Z',
      },
      user: {
        id: 'usr_01',
        email: 'user@example.com',
        name: 'A',
      },
    },

    check: {
      authenticated: true,
      user: {
        id: 'usr_01',
        email: 'user@example.com',
        name: 'A',
      },
    },
  },
};
