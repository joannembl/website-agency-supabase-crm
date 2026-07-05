// Supabase Edge Function: generate-demo-site
// Required secret: OPENAI_API_KEY
// Deploy with: supabase functions deploy generate-demo-site
// Set secret: supabase secrets set OPENAI_API_KEY=sk-...

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const apiKey = Deno.env.get('OPENAI_API_KEY')
    if (!apiKey) throw new Error('OPENAI_API_KEY is not configured.')

    const input = await req.json()
    const prompt = `You are building a demo website for a local business. Return only valid JSON with keys: briefMarkdown, siteCopy, html. The html must be a complete responsive single-file static website with inline CSS. Business input: ${JSON.stringify(input)}`

    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        input: prompt,
        text: { format: { type: 'json_object' } },
      }),
    })

    if (!response.ok) {
      const text = await response.text()
      throw new Error(`OpenAI request failed: ${text}`)
    }

    const result = await response.json()
    const outputText = result.output_text || result.output?.flatMap((item: any) => item.content || []).map((content: any) => content.text || '').join('')
    const parsed = JSON.parse(outputText)

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
