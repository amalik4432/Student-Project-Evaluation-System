const localOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:3001",
];

export const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = [process.env.FRONTEND_URL, ...localOrigins].filter(
      Boolean,
    );
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error("Origin not allowed by CORS"));
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: "GET,PUT,PATCH,POST,DELETE",
};
