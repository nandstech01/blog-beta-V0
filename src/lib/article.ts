import { Anthropic } from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface GenerateArticleInput {
  title: string;
  outline: string[];
  keywords: string[];
  category: string;
}

export async function generateArticle(input: GenerateArticleInput) {
  const { title, outline, keywords, category } = input;

  // プロンプトを構築
  const prompt = `
記事タイトル: ${title}

記事の構成:
${outline.map((item, index) => `${index + 1}. ${item}`).join('\n')}

キーワード: ${keywords.join(', ')}
カテゴリー: ${category}

以上の情報を元に、以下の要件を満たす記事を生成してください：

1. 各セクションは見出しから始まり、その後に詳細な説明が続きます
2. 読者にとって価値のある情報を提供し、実用的なアドバイスを含めます
3. 自然な日本語で、読みやすい文章を心がけます
4. 専門用語は必要に応じて説明を加えます
5. 記事は Markdown 形式で生成してください

また、記事の内容を200文字程度で要約した説明文も生成してください。

形式:
===記事本文===
(ここに記事本文)

===説明文===
(ここに説明文)
`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 4000,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    const fullContent = response.content[0].text;
    if (!fullContent) {
      throw new Error('Failed to generate article content');
    }

    // 記事本文と説明文を分離
    const [content, description] = fullContent.split('===説明文===').map(text => 
      text.replace('===記事本文===', '').trim()
    );

    if (!content || !description) {
      throw new Error('Failed to parse article content or description');
    }

    return {
      content,
      metadata: {
        title,
        keywords,
        category,
        description,
        generatedAt: new Date().toISOString(),
      },
    };
  } catch (error) {
    console.error('Error generating article:', error);
    throw new Error('Failed to generate article');
  }
} 