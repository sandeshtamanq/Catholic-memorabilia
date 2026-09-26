import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { GeneratedProductDto } from '../../core/product/dto/GenerateProductDto';

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-sonnet-4-6';

const ALLOWED_CATEGORIES = [
  'rosary beads',
  'crosses',
  'statues',
  'keychains',
  't-shirts',
  'hoodies',
  'caps',
  'artwork',
  'other',
];

@Injectable()
export class GptService {
  private readonly apiKey = process.env.ANTHROPIC_API_KEY;

  async generateFromImage(
    file: Express.Multer.File,
  ): Promise<GeneratedProductDto> {
    if (!file) {
      throw new BadRequestException('No image file uploaded');
    }
    if (!this.apiKey) {
      throw new InternalServerErrorException(
        'ANTHROPIC_API_KEY is not configured on the server',
      );
    }

    const base64Image = file.buffer.toString('base64');
    const mediaType = file.mimetype; // e.g. 'image/jpeg', 'image/png'

    const systemPrompt = `You are helping catalog products for a Catholic memorabilia e-commerce store called "That's the Spirit".
Given a photo of a single product, respond with ONLY a JSON object, no markdown fences, no extra text, in this exact shape:
{"title": "string", "description": "string", "category": "string", "tags": ["string", "string"]}

Rules:
- title: short and catchy, under 8 words.
- description: 2-3 warm, spiritual-toned sentences suitable for a Catholic gift shop product page.
- category: must be exactly one of: ${ALLOWED_CATEGORIES.join(', ')}.
- tags: 3-5 short lowercase search keywords.
- If the image does not clearly show a sellable product, still make a best-effort guess.`;

    const response = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 500,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: mediaType,
                  data: base64Image,
                },
              },
              {
                type: 'text',
                text: 'Generate the product listing JSON for this image.',
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new InternalServerErrorException(
        `AI API error: ${response.status} ${errText}`,
      );
    }

    const data = await response.json();
    const textBlock = data.content?.find((c: any) => c.type === 'text');

    if (!textBlock) {
      throw new InternalServerErrorException('AI API returned no text content');
    }

    let parsed: GeneratedProductDto;
    try {
      const cleaned = textBlock.text.replace(/```json|```/g, '').trim();
      parsed = JSON.parse(cleaned);
    } catch (e) {
      throw new InternalServerErrorException(
        'Failed to parse AI response as JSON',
      );
    }

    if (!ALLOWED_CATEGORIES.includes(parsed.category)) {
      parsed.category = 'other';
    }

    return parsed;
  }
}
