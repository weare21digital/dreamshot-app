import type { ImageSourcePropType } from 'react-native';
import queenPreview from '../../assets/styles/the-queen.jpg';
import diamondPreview from '../../assets/styles/the-diamond.jpg';
import dukePreview from '../../assets/styles/the-duke.jpg';
import gardenSoireePreview from '../../assets/styles/garden-soiree.jpg';
import midnightCourtPreview from '../../assets/styles/midnight-court.jpg';
import heiressPreview from '../../assets/styles/the-heiress.jpg';
import regencyMasqueradePreview from '../../assets/styles/regency-masquerade.jpg';
import coronationPreview from '../../assets/styles/the-coronation.jpg';
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
    id: 'regal',
    label: 'Regal & Poised',
    emoji: '👑',
    promptSuffix: 'Subtle regal head turn, composed aristocratic posture, slow dignified movement, candlelight flicker',
  },
  {
    id: 'ballroom',
    label: 'Ballroom Dance',
    emoji: '💃',
    promptSuffix: 'Graceful ballroom waltz movement, flowing dress motion, elegant spinning, warm chandelier lighting',
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
    id: 'the-queen',
    title: 'The Queen',
    subtitle: 'Imperial authority',
    description: 'Regal throne image with crown, velvet gown, and gilded hall lighting.',
    prompt:
      'A majestic cinematic queen in an ornate throne room, rich velvet gown, diamond crown, baroque details, dramatic neon violet and cyan lighting, ultra-detailed image',
    animationPrompt:
      'The queen slowly turns toward camera, candlelight flickers, subtle fabric movement, cinematic cinematic atmosphere',
    exampleImageUrl: 'https://upload.wikimedia.org/wikipedia/commons/7/7a/Elizabeth_I_%28Armada_Portrait%29.jpg',
    photoCost: DREAMSHOT_PHOTO_COST,
    videoCost: DREAMSHOT_VIDEO_COST,
    tags: ['throne-room', 'crown', 'dramatic'],
  },
  {
    id: 'the-diamond',
    title: 'The Diamond',
    subtitle: 'Ballroom brilliance',
    description: 'High-society ballroom image with crystal chandelier and jeweled styling.',
    prompt:
      'Elegant aristocratic image in a grand ballroom, crystal chandeliers, sparkling jewels, satin dress, refined expression, warm cinematic tones',
    animationPrompt:
      'Slow camera drift in a candlelit ballroom, chandelier shimmer and subtle smile movement',
    exampleImageUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/59/Thomas_Lawrence_-_Lady_Maria_Conyngham.jpg',
    photoCost: DREAMSHOT_PHOTO_COST,
    videoCost: DREAMSHOT_VIDEO_COST,
    tags: ['ballroom', 'jewels', 'luxury'],
  },
  {
    id: 'the-duke',
    title: 'The Duke',
    subtitle: 'Noble command',
    description: 'Refined noble image in tailored tailcoat against a stately manor backdrop.',
    prompt:
      'A distinguished duke image in regency-era manor interior, tailored navy tailcoat, subtle violet embroidery, aristocratic posture, realistic cinematic image',
    animationPrompt:
      'Gentle head turn and coat movement near a manor window with warm sunlight',
    exampleImageUrl: 'https://upload.wikimedia.org/wikipedia/commons/b/b3/Thomas_Lawrence_-_Arthur_Wellesley%2C_1st_Duke_of_Wellington_-_Google_Art_Project.jpg',
    photoCost: DREAMSHOT_PHOTO_COST,
    videoCost: DREAMSHOT_VIDEO_COST,
    tags: ['tailcoat', 'manor', 'classic'],
  },
  {
    id: 'garden-soiree',
    title: 'Garden Soirée',
    subtitle: 'Aristocratic romance',
    description: 'Soft natural-light image in a cinematic garden with ornate floral framing.',
    prompt:
      'Cinematic aristocrat image in an elegant estate garden, blooming flowers, ornate arches, soft natural light, pastel details, period fashion',
    animationPrompt: 'Light breeze through hair and garments, petals drifting in the air, serene garden ambiance',
    exampleImageUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/0e/Thomas_Gainsborough_-_Portrait_of_Mrs._Richard_Brinsley_Sheridan.jpg',
    photoCost: DREAMSHOT_PHOTO_COST,
    videoCost: DREAMSHOT_VIDEO_COST,
    tags: ['garden', 'romantic', 'floral'],
  },
  {
    id: 'midnight-court',
    title: 'Midnight Court',
    subtitle: 'Candlelit intrigue',
    description: 'Dark, moody cinematic scene lit by candelabras and moonlight through drapes.',
    prompt:
      'Aristocratic image in a dim cinematic court, candlelit ambiance, moonlight through velvet drapes, intricate costume details, cinematic chiaroscuro',
    animationPrompt: 'Candle flames flicker while subject maintains poised cinematic gaze in moonlit chamber',
    exampleImageUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/4b/George_Romney_-_Lady_Hamilton_as_Circe.jpg',
    photoCost: DREAMSHOT_PHOTO_COST,
    videoCost: DREAMSHOT_VIDEO_COST,
    tags: ['candlelight', 'moody', 'court'],
  },
  {
    id: 'the-heiress',
    title: 'The Heiress',
    subtitle: 'Velvet elegance',
    description: 'Polished image with rich textures, pearls, and subtle vintage glamour.',
    prompt:
      'Regency-era heiress image, velvet gown, pearl jewelry, aristocratic styling, soft-focus background, highly detailed skin and fabric texture',
    animationPrompt: 'Subtle turn with elegant hand motion, pearls catching warm rim light',
    exampleImageUrl: 'https://upload.wikimedia.org/wikipedia/commons/8/89/Francois_Gerard_-_Josephine_empereur.jpg',
    photoCost: DREAMSHOT_PHOTO_COST,
    videoCost: DREAMSHOT_VIDEO_COST,
    tags: ['pearls', 'velvet', 'glamour'],
  },
  {
    id: 'regency-masquerade',
    title: 'Regency Masquerade',
    subtitle: 'Mystique in neon',
    description: 'Masked evening look with ornate decor and festive aristocratic drama.',
    prompt:
      'Cinematic masquerade image, ornate iridescent mask, luxurious regency ballroom, dramatic lighting, cinematic elegance, rich costume detail',
    animationPrompt: 'Masked gaze shifts, silk mask ribbon moves, glittering ballroom ambience',
    exampleImageUrl: 'https://upload.wikimedia.org/wikipedia/commons/6/63/Franz_Xaver_Winterhalter_-_Empress_Elisabeth_of_Austria_in_Court_Gala_Dress_with_Diamond_Stars.jpg',
    photoCost: DREAMSHOT_PHOTO_COST,
    videoCost: DREAMSHOT_VIDEO_COST,
    tags: ['masquerade', 'neon', 'dramatic'],
  },
  {
    id: 'the-coronation',
    title: 'The Coronation',
    subtitle: 'Grand ceremony',
    description: 'Ceremonial image in cathedral-like setting with cinematic insignia.',
    prompt:
      'Cinematic coronation image, ceremonial robes, ornate cathedral interior, violet and cyan emblems, epic yet refined composition, photorealistic detail',
    animationPrompt: 'Slow majestic camera push with glowing stained-glass light and subtle robe motion',
    exampleImageUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/5f/Jacques-Louis_David%2C_The_Coronation_of_Napoleon_edit.jpg',
    photoCost: DREAMSHOT_PHOTO_COST,
    videoCost: DREAMSHOT_VIDEO_COST,
    tags: ['ceremony', 'cathedral', 'epic'],
  },
];

const DREAMSHOT_STYLE_PREVIEW_IMAGES: Record<string, ImageSourcePropType> = {
  'the-queen': queenPreview,
  'the-diamond': diamondPreview,
  'the-duke': dukePreview,
  'garden-soiree': gardenSoireePreview,
  'midnight-court': midnightCourtPreview,
  'the-heiress': heiressPreview,
  'regency-masquerade': regencyMasqueradePreview,
  'the-coronation': coronationPreview,
};

export const getStylePreviewSource = (style: DreamshotStylePreset): ImageSourcePropType =>
  DREAMSHOT_STYLE_PREVIEW_IMAGES[style.id] ?? { uri: style.exampleImageUrl };

export const DREAMSHOT_STYLE_PRESETS_BY_ID = Object.fromEntries(
  DREAMSHOT_STYLE_PRESETS.map((style) => [style.id, style]),
) as Record<string, DreamshotStylePreset>;
