import type { ImageSourcePropType } from 'react-native';
import cinematicPreview from '../../assets/styles/the-queen.jpg';
import render3dPreview from '../../assets/styles/the-diamond.jpg';
import oilPaintingPreview from '../../assets/styles/the-duke.jpg';
import watercolorPreview from '../../assets/styles/garden-soiree.jpg';
import animePreview from '../../assets/styles/midnight-court.jpg';
import photorealPreview from '../../assets/styles/the-heiress.jpg';
import pixelArtPreview from '../../assets/styles/regency-masquerade.jpg';
import fantasyMattePreview from '../../assets/styles/the-coronation.jpg';
import type { DreamshotStylePreset } from '../features/generation/types';

export const DREAMSHOT_PHOTO_COST = 20;
export const DREAMSHOT_VIDEO_COST = 50;
export const DREAMSHOT_BRAND_COLOR = '#CC97FF';
export const DREAMSHOT_SIGNATURE_GRADIENT = ['#9C48EA', '#53DDFC'] as const;

export type AnimationStyle = {
  id: string;
  label: string;
  emoji: string;
  promptSuffix: string;
};

export const ANIMATION_STYLES: AnimationStyle[] = [
  {
    id: 'cinematic-pan',
    label: 'Cinematic Pan',
    emoji: '🎬',
    promptSuffix: 'Slow cinematic camera pan, subtle subject movement, dramatic depth of field, atmospheric lighting',
  },
  {
    id: 'dynamic-spin',
    label: 'Dynamic Spin',
    emoji: '🌀',
    promptSuffix: 'Smooth rotational camera move, dynamic body turn, energetic momentum, stylized motion blur',
  },
  {
    id: 'dramatic',
    label: 'Dramatic Reveal',
    emoji: '🎭',
    promptSuffix: 'Dramatic slow camera push-in, intense gaze, wind in hair, cinematic lighting shift, theatrical presence',
  },
  {
    id: 'gentle',
    label: 'Gentle Breeze',
    emoji: '🌿',
    promptSuffix: 'Gentle wind blowing through hair and garments, soft natural movement, petals or leaves drifting, serene atmosphere',
  },
  {
    id: 'celebration',
    label: 'Cinematic Celebration',
    emoji: '🥂',
    promptSuffix: 'Joyful celebratory movement, raising a glass, warm smile, festive atmosphere, sparkling lights',
  },
];

export const DREAMSHOT_STYLE_PRESETS: DreamshotStylePreset[] = [
  {
    id: 'cinematic-vibe',
    title: 'Cinematic',
    subtitle: 'Movie-grade lighting',
    description: 'Movie-scene portrait with dramatic lighting, atmospheric haze, and deep color contrast.',
    prompt:
      'Create a cinematic portrait that feels like a still from a prestige film, with dramatic key lighting on the face, subtle atmospheric haze in the background, rich violet and cyan color separation, and shallow depth of field while preserving natural facial structure and fine skin detail.',
    animationPrompt:
      'Subject slowly turns toward camera, practical lights flicker softly, subtle fabric motion, dramatic cinematic atmosphere',
    exampleImageUrl: 'https://upload.wikimedia.org/wikipedia/commons/7/7a/Elizabeth_I_%28Armada_Portrait%29.jpg',
    photoCost: DREAMSHOT_PHOTO_COST,
    videoCost: DREAMSHOT_VIDEO_COST,
    tags: ['cinematic', 'portrait', 'dramatic'],
  },
  {
    id: 'render-3d',
    title: '3D Render',
    subtitle: 'Stylized CGI depth',
    description: 'High-fidelity CGI portrait with glossy materials, volumetric light, and stylized depth.',
    prompt:
      'Render this portrait as a premium stylized 3D character with physically based materials, soft glossy highlights on clothing and accessories, volumetric rim light from behind, and cinematic color grading that keeps the expression elegant and believable.',
    animationPrompt:
      'Slow orbital camera drift, glinting highlights across metallic details, subtle facial expression change',
    exampleImageUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/59/Thomas_Lawrence_-_Lady_Maria_Conyngham.jpg',
    photoCost: DREAMSHOT_PHOTO_COST,
    videoCost: DREAMSHOT_VIDEO_COST,
    tags: ['3d', 'cgi', 'stylized'],
  },
  {
    id: 'oil-painting',
    title: 'Oil Painting',
    subtitle: 'Classic brushwork',
    description: 'Classic painted portrait with rich brush texture and museum-style lighting.',
    prompt:
      'Transform this portrait into a classical oil painting with visible layered brushwork, textured canvas grain, warm chiaroscuro lighting, and a timeless museum-quality composition that prioritizes dignified posture and rich tonal depth.',
    animationPrompt:
      'Subtle painted-style motion, brush-stroke shimmer, and warm gallery-like light shift',
    exampleImageUrl: 'https://upload.wikimedia.org/wikipedia/commons/b/b3/Thomas_Lawrence_-_Arthur_Wellesley%2C_1st_Duke_of_Wellington_-_Google_Art_Project.jpg',
    photoCost: DREAMSHOT_PHOTO_COST,
    videoCost: DREAMSHOT_VIDEO_COST,
    tags: ['oil-painting', 'classic', 'artistic'],
  },
  {
    id: 'watercolor-dream',
    title: 'Watercolor',
    subtitle: 'Soft pigment wash',
    description: 'Airy watercolor portrait with soft pigment blooms and delicate pastel transitions.',
    prompt:
      'Illustrate this portrait as a refined watercolor painting with soft pigment washes, gentle edge bleeding, delicate pastel transitions, and airy natural light, while keeping facial proportions recognizable and expressive.',
    animationPrompt: 'Gentle watercolor ripple movement, drifting pigment texture, and soft floating particles',
    exampleImageUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/0e/Thomas_Gainsborough_-_Portrait_of_Mrs._Richard_Brinsley_Sheridan.jpg',
    photoCost: DREAMSHOT_PHOTO_COST,
    videoCost: DREAMSHOT_VIDEO_COST,
    tags: ['watercolor', 'pastel', 'soft'],
  },
  {
    id: 'anime-glow',
    title: 'Anime',
    subtitle: 'Bold cel-shaded look',
    description: 'Vibrant anime portrait with cel-shading, expressive eyes, and neon edge lighting.',
    prompt:
      'Reimagine this portrait in a high-quality anime style with crisp cel shading, clean expressive linework, luminous eyes, and neon edge lighting, using bold but controlled color blocking that still reflects the subject’s likeness.',
    animationPrompt: 'Energetic anime camera push, hair sway, blinking highlights, and subtle speed lines',
    exampleImageUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/4b/George_Romney_-_Lady_Hamilton_as_Circe.jpg',
    photoCost: DREAMSHOT_PHOTO_COST,
    videoCost: DREAMSHOT_VIDEO_COST,
    tags: ['anime', 'cel-shaded', 'vibrant'],
  },
  {
    id: 'photoreal-pro',
    title: 'Photorealistic',
    subtitle: 'Natural DSLR realism',
    description: 'Natural DSLR-style portrait with realistic skin texture and balanced studio lighting.',
    prompt:
      'Generate a photorealistic DSLR-style portrait with true-to-life skin texture, natural micro-contrast, balanced studio lighting, smooth bokeh separation, and neutral cinematic color grading that avoids over-processing.',
    animationPrompt: 'Subtle head turn with realistic micro-expressions and natural studio light rolloff',
    exampleImageUrl: 'https://upload.wikimedia.org/wikipedia/commons/8/89/Francois_Gerard_-_Josephine_empereur.jpg',
    photoCost: DREAMSHOT_PHOTO_COST,
    videoCost: DREAMSHOT_VIDEO_COST,
    tags: ['photoreal', 'dslr', 'natural'],
  },
  {
    id: 'pixel-pop',
    title: 'Pixel Art',
    subtitle: 'Retro game aesthetic',
    description: 'Retro pixel-art portrait with chunky dithering and arcade-era color palettes.',
    prompt:
      'Convert this portrait into polished retro pixel art inspired by 16-bit games, with intentional pixel clusters, crisp dithering, limited arcade-era color palette, and readable facial features in a sprite-like composition.',
    animationPrompt: 'Sprite-style frame animation, blinking pixels, and looping retro background shimmer',
    exampleImageUrl: 'https://upload.wikimedia.org/wikipedia/commons/6/63/Franz_Xaver_Winterhalter_-_Empress_Elisabeth_of_Austria_in_Court_Gala_Dress_with_Diamond_Stars.jpg',
    photoCost: DREAMSHOT_PHOTO_COST,
    videoCost: DREAMSHOT_VIDEO_COST,
    tags: ['pixel-art', 'retro', '8bit'],
  },
  {
    id: 'fantasy-matte',
    title: 'Fantasy Matte',
    subtitle: 'Epic concept art',
    description: 'Epic fantasy matte portrait with painterly depth and world-building atmosphere.',
    prompt:
      'Create an epic fantasy matte portrait with painterly depth, dramatic atmospheric perspective, a grand story-rich environment behind the subject, and concept-art scale that feels cinematic while keeping the face as the visual anchor.',
    animationPrompt: 'Slow cinematic push through misty fantasy environment with subtle cloth and light movement',
    exampleImageUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/5f/Jacques-Louis_David%2C_The_Coronation_of_Napoleon_edit.jpg',
    photoCost: DREAMSHOT_PHOTO_COST,
    videoCost: DREAMSHOT_VIDEO_COST,
    tags: ['fantasy', 'matte-painting', 'epic'],
  },
];

const DREAMSHOT_STYLE_PREVIEW_IMAGES: Record<string, ImageSourcePropType> = {
  'cinematic-vibe': cinematicPreview,
  'render-3d': render3dPreview,
  'oil-painting': oilPaintingPreview,
  'watercolor-dream': watercolorPreview,
  'anime-glow': animePreview,
  'photoreal-pro': photorealPreview,
  'pixel-pop': pixelArtPreview,
  'fantasy-matte': fantasyMattePreview,
};

export const getStylePreviewSource = (style: DreamshotStylePreset): ImageSourcePropType =>
  DREAMSHOT_STYLE_PREVIEW_IMAGES[style.id] ?? { uri: style.exampleImageUrl };

export const DREAMSHOT_STYLE_PRESETS_BY_ID = Object.fromEntries(
  DREAMSHOT_STYLE_PRESETS.map((style) => [style.id, style]),
) as Record<string, DreamshotStylePreset>;
