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
      'A cinematic portrait scene with dramatic key light, atmospheric haze, rich violet and cyan color contrast, shallow depth of field, ultra-detailed image',
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
      'Stylized 3D render portrait, physically based materials, glossy highlights, volumetric rim light, refined expression, cinematic tones',
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
      'Oil painting portrait, visible brush strokes, textured canvas look, warm chiaroscuro lighting, timeless composition',
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
      'Watercolor portrait illustration, soft pigment wash, delicate edge bleed, pastel palette, airy natural lighting',
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
      'Anime style portrait, crisp cel-shading, expressive linework, neon rim lights, dramatic color blocking',
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
      'Photorealistic portrait capture, true-to-life skin detail, clean bokeh background, natural color grading, high dynamic range',
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
      'Pixel art portrait scene, 16-bit palette, crisp dithering, stylized sprite-like features, retro game vibe',
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
      'Fantasy matte portrait, grand environmental backdrop, painterly atmosphere, dramatic scale, epic concept-art composition',
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
