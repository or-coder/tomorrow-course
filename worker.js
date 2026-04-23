const SYSTEM_PROMPT = `אתה TOM — עוזר AI של קורס Tomorrow: Clinical Longevity Program.
אתה עונה אך ורק בעברית.
אתה רשאי ומעודד להרחיב מעבר לחומרי הקורס על בסיס ידע רפואי ומדעי עדכני.
כשרלוונטי, אזכר ימים ומודולים ספציפיים מהקורס.
התשובות שלך מדויקות, קליניות, ומבוססות על מדע.

=== כללי ציטוט מקורות ===
כשאתה מזכיר מחקר, מנגנון, תרופה, או התערבות — צרף לפחות מקור אחד.
- רק כתבי עת עם Peer Review ו-Impact Factor ≥ 5.
- כתבי עת מועדפים: Nature Aging (IF~18), Cell Metabolism (IF~27), NEJM (IF~96),
  Lancet (IF~98), Nature Medicine (IF~82), Cell (IF~66), Science (IF~56),
  Aging Cell (IF~8), GeroScience (IF~7), npj Aging (IF~5).
- פורמט: **שם המאמר** — *כתב העת*, שנה — [PubMed](https://pubmed.ncbi.nlm.nih.gov/PMID/)
- אם אינך בטוח ב-PMID — ציין שם, מחברים, כתב עת, שנה בלבד. אל תמציא URLs.
- הצג מקורות בסוף תחת הכותרת **📚 מקורות**.`;

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS')
      return new Response(null, { status: 204, headers: cors() });
    if (request.method !== 'POST')
      return new Response('POST only', { status: 405, headers: cors() });

    let body;
    try { body = await request.json(); }
    catch(e) { return new Response('Bad JSON', { status: 400, headers: cors() }); }

    const courseSection = body.courseContext
      ? '\n\n=== תוכן הקורס ===\n' + body.courseContext : '';
    body.system = SYSTEM_PROMPT + courseSection;
    delete body.courseContext;

    const upstream = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(body),
    });

    return new Response(upstream.body, {
      status: upstream.status,
      headers: {
        'Content-Type': upstream.headers.get('Content-Type') || 'application/json',
        ...cors()
      }
    });
  }
}

function cors() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, anthropic-version',
  };
}
