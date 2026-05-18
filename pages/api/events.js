const emitter = require('../../lib/events');

export default function handler(req, res) {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const onLead = (data) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  emitter.on('lead', onLead);

  req.on('close', () => {
    emitter.removeListener('lead', onLead);
  });
}
