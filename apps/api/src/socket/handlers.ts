import { Server, Socket } from 'socket.io';

export function registerSocketHandlers(io: Server) {
  io.on('connection', (socket: Socket) => {
    console.log(`[Socket] Client connected: ${socket.id}`);

    // Join a call session room
    socket.on('join:session', ({ session_id }: { session_id: string }) => {
      socket.join(`session:${session_id}`);
      socket.emit('session:joined', { session_id });
      console.log(`[Socket] ${socket.id} joined session ${session_id}`);
    });

    // Leave a session room
    socket.on('leave:session', ({ session_id }: { session_id: string }) => {
      socket.leave(`session:${session_id}`);
    });

    // ── SurakshaCall Real-time Events ──────────────────────────────────────

    // Client broadcasts raw audio frame features → server responds with risk score
    socket.on('audio:frame', (data: { session_id: string; features?: any; language?: string }) => {
      const { session_id, language = 'en' } = data;

      // Simulate on-server inference (in production: forward to ONNX runtime)
      const risk_score = Math.round(20 + Math.random() * 75);
      const anomalies: string[] = [];
      if (risk_score > 60) anomalies.push('Spectral irregularity detected');
      if (risk_score > 75) anomalies.push('Phase discontinuity');
      if (risk_score > 85) anomalies.push('Neural codec artifact');

      const event = {
        session_id,
        risk_score,
        label: risk_score >= 65 ? 'likely_deepfake' : risk_score >= 35 ? 'suspicious' : 'genuine',
        anomalies,
        language,
        timestamp: new Date().toISOString(),
      };

      // Emit back to the session room
      io.to(`session:${session_id}`).emit('risk:update', event);
    });

    // Client requests a challenge prompt
    socket.on('challenge:request', ({ session_id, language }: { session_id: string; language?: string }) => {
      const questions = language === 'hi'
        ? ['हमारे घर की गाय का नाम क्या है?', 'पिछली ईद पर हम कहाँ गए थे?']
        : ["What is the name of our family pet?", "What city did we celebrate last Diwali?"];
      const question = questions[Math.floor(Math.random() * questions.length)];
      const challenge_id = `ch_${Date.now()}`;

      io.to(`session:${session_id}`).emit('challenge:prompt', {
        session_id,
        challenge_id,
        question,
        language: language || 'en',
      });
    });

    // Registry pre-call flag check
    socket.on('registry:check', ({ number, session_id }: { number: string; session_id?: string }) => {
      // Simulate lookup — in production query blockchain/DB
      const knownScamNumbers = ['9876543210', '8800112233', '1234567890'];
      const normalized = number.replace(/\D/g, '').slice(-10);
      const isKnown = knownScamNumbers.includes(normalized);

      socket.emit('registry:flag', {
        number,
        flagged: isKnown,
        confidence: isKnown ? 80 + Math.round(Math.random() * 15) : 0,
        report_count: isKnown ? 3 + Math.round(Math.random() * 7) : 0,
        session_id,
      });
    });

    socket.on('disconnect', () => {
      console.log(`[Socket] Client disconnected: ${socket.id}`);
    });
  });
}
