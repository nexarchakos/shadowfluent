export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'ElevenLabs API key not configured' });
    }

    const {
      text,
      settings,
    } = req.body || {};

    if (!text || !settings) {
      return res.status(400).json({ error: 'Missing text or settings' });
    }

    const {
      gender,
      accent,
      rate,
    } = settings;

    const voiceByAccentMale = {
      british: process.env.ELEVENLABS_VOICE_BRITISH_MALE,
      american: process.env.ELEVENLABS_VOICE_AMERICAN_MALE,
      australian: process.env.ELEVENLABS_VOICE_AUSTRALIAN_MALE,
      irish: process.env.ELEVENLABS_VOICE_IRISH_MALE,
      canadian: process.env.ELEVENLABS_VOICE_CANADIAN_MALE,
    };
    const voiceByAccentFemale = {
      british: process.env.ELEVENLABS_VOICE_BRITISH_FEMALE,
      american: process.env.ELEVENLABS_VOICE_AMERICAN_FEMALE,
      australian: process.env.ELEVENLABS_VOICE_AUSTRALIAN_FEMALE,
      irish: process.env.ELEVENLABS_VOICE_IRISH_FEMALE,
      canadian: process.env.ELEVENLABS_VOICE_CANADIAN_FEMALE,
    };

    const defaultVoice = process.env.ELEVENLABS_VOICE_DEFAULT;
    const maleVoice = process.env.ELEVENLABS_VOICE_MALE;
    const femaleVoice = process.env.ELEVENLABS_VOICE_FEMALE;

    let voiceId = null;
    if (gender === 'male') {
      voiceId = voiceByAccentMale[accent] || maleVoice || defaultVoice;
    } else if (gender === 'female') {
      voiceId = voiceByAccentFemale[accent] || femaleVoice || defaultVoice;
    } else {
      voiceId = defaultVoice || maleVoice || femaleVoice;
    }

    if (!voiceId) {
      return res.status(500).json({ error: 'ElevenLabs voice id not configured' });
    }

    const modelId = process.env.ELEVENLABS_MODEL || 'eleven_flash_v2';

    const rateMap = {
      slow: 0.7,
      normal: 1.0,
      fast: 1.3,
    };
    const stability = rate === 'slow' ? 0.55 : rate === 'fast' ? 0.35 : 0.4;
    const similarityBoost = 0.8;

    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
        Accept: 'audio/mpeg',
      },
      body: JSON.stringify({
        text,
        model_id: modelId,
        voice_settings: { stability, similarity_boost: similarityBoost },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      return res.status(response.status).json({
        error: errorText || 'ElevenLabs request failed',
      });
    }

    const audioBuffer = Buffer.from(await response.arrayBuffer());
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).send(audioBuffer);
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Failed to generate audio' });
  }
}
