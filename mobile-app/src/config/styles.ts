import type { ImageSourcePropType } from 'react-native';
import queenPreview from '../../assets/styles/the-queen.jpg';
import diamondPreview from '../../assets/styles/the-diamond.jpg';
import dukePreview from '../../assets/styles/the-duke.jpg';
import gardenSoireePreview from '../../assets/styles/garden-soiree.jpg';
import midnightCourtPreview from '../../assets/styles/midnight-court.jpg';
import heiressPreview from '../../assets/styles/the-heiress.jpg';
import regencyMasqueradePreview from '../../assets/styles/regency-masquerade.jpg';
import coronationPreview from '../../assets/styles/the-coronation.jpg';
import type { RoyalStylePreset } from '../features/generation/types';

export const ROYAL_PHOTO_COST = 20;
export const ROYAL_VIDEO_COST = 50;

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
    label: 'Royal Celebration',
    emoji: '🥂',
    promptSuffix: 'Joyful celebratory movement, raising a glass, warm smile, festive atmosphere, sparkling lights',
  },
];

export const ROYAL_STYLE_PRESETS: RoyalStylePreset[] = [
  {
    id: 'the-queen',
    title: 'The Queen',
    subtitle: 'Imperial authority',
    description: 'Regal throne portrait with crown, velvet gown, and gilded hall lighting.',
    prompt:
      'A majestic royal queen in an ornate throne room, rich velvet gown, diamond crown, baroque details, dramatic soft golden lighting, ultra-detailed portrait',
    animationPrompt:
      'The queen slowly turns toward camera, candlelight flickers, subtle fabric movement, cinematic royal atmosphere',
    exampleImageUrl: 'https://upload.wikimedia.org/wikipedia/commons/7/7a/Elizabeth_I_%28Armada_Portrait%29.jpg',
    photoCost: ROYAL_PHOTO_COST,
    videoCost: ROYAL_VIDEO_COST,
    tags: ['throne-room', 'crown', 'dramatic'],
  },
  {
    id: 'the-diamond',
    title: 'The Diamond',
    subtitle: 'Ballroom brilliance',
    description: 'High-society ballroom portrait with crystal chandelier and jeweled styling.',
    prompt:
      'Elegant aristocratic portrait in a grand ballroom, crystal chandeliers, sparkling jewels, satin dress, refined expression, warm cinematic tones',
    animationPrompt:
      'Slow camera drift in a candlelit ballroom, chandelier shimmer and subtle smile movement',
    exampleImageUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/59/Thomas_Lawrence_-_Lady_Maria_Conyngham.jpg',
    photoCost: ROYAL_PHOTO_COST,
    videoCost: ROYAL_VIDEO_COST,
    tags: ['ballroom', 'jewels', 'luxury'],
  },
  {
    id: 'the-duke',
    title: 'The Duke',
    subtitle: 'Noble command',
    description: 'Refined noble portrait in tailored tailcoat against a stately manor backdrop.',
    prompt:
      'A distinguished duke portrait in regency-era manor interior, tailored navy tailcoat, subtle gold embroidery, aristocratic posture, realistic cinematic portrait',
    animationPrompt:
      'Gentle head turn and coat movement near a manor window with warm sunlight',
    exampleImageUrl: 'https://upload.wikimedia.org/wikipedia/commons/b/b3/Thomas_Lawrence_-_Arthur_Wellesley%2C_1st_Duke_of_Wellington_-_Google_Art_Project.jpg',
    photoCost: ROYAL_PHOTO_COST,
    videoCost: ROYAL_VIDEO_COST,
    tags: ['tailcoat', 'manor', 'classic'],
  },
  {
    id: 'garden-soiree',
    title: 'Garden Soirée',
    subtitle: 'Aristocratic romance',
    description: 'Soft natural-light portrait in a royal garden with ornate floral framing.',
    prompt:
      'Royal aristocrat portrait in an elegant estate garden, blooming flowers, ornate arches, soft natural light, pastel details, period fashion',
    animationPrompt: 'Light breeze through hair and garments, petals drifting in the air, serene garden ambiance',
    exampleImageUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/0e/Thomas_Gainsborough_-_Portrait_of_Mrs._Richard_Brinsley_Sheridan.jpg',
    photoCost: ROYAL_PHOTO_COST,
    videoCost: ROYAL_VIDEO_COST,
    tags: ['garden', 'romantic', 'floral'],
  },
  {
    id: 'midnight-court',
    title: 'Midnight Court',
    subtitle: 'Candlelit intrigue',
    description: 'Dark, moody royal scene lit by candelabras and moonlight through drapes.',
    prompt:
      'Aristocratic portrait in a dim royal court, candlelit ambiance, moonlight through velvet drapes, intricate costume details, cinematic chiaroscuro',
    animationPrompt: 'Candle flames flicker while subject maintains poised royal gaze in moonlit chamber',
    exampleImageUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/4b/George_Romney_-_Lady_Hamilton_as_Circe.jpg',
    photoCost: ROYAL_PHOTO_COST,
    videoCost: ROYAL_VIDEO_COST,
    tags: ['candlelight', 'moody', 'court'],
  },
  {
    id: 'the-heiress',
    title: 'The Heiress',
    subtitle: 'Velvet elegance',
    description: 'Polished portrait with rich textures, pearls, and subtle vintage glamour.',
    prompt:
      'Regency-era heiress portrait, velvet gown, pearl jewelry, aristocratic styling, soft-focus background, highly detailed skin and fabric texture',
    animationPrompt: 'Subtle turn with elegant hand motion, pearls catching warm rim light',
    exampleImageUrl: 'https://upload.wikimedia.org/wikipedia/commons/8/89/Francois_Gerard_-_Josephine_empereur.jpg',
    photoCost: ROYAL_PHOTO_COST,
    videoCost: ROYAL_VIDEO_COST,
    tags: ['pearls', 'velvet', 'glamour'],
  },
  {
    id: 'regency-masquerade',
    title: 'Regency Masquerade',
    subtitle: 'Mystique in gold',
    description: 'Masked evening look with ornate decor and festive aristocratic drama.',
    prompt:
      'Royal masquerade portrait, ornate gold mask, luxurious regency ballroom, dramatic lighting, cinematic elegance, rich costume detail',
    animationPrompt: 'Masked gaze shifts, silk mask ribbon moves, glittering ballroom ambience',
    exampleImageUrl: 'https://upload.wikimedia.org/wikipedia/commons/6/63/Franz_Xaver_Winterhalter_-_Empress_Elisabeth_of_Austria_in_Court_Gala_Dress_with_Diamond_Stars.jpg',
    photoCost: ROYAL_PHOTO_COST,
    videoCost: ROYAL_VIDEO_COST,
    tags: ['masquerade', 'gold', 'dramatic'],
  },
  {
    id: 'the-coronation',
    title: 'The Coronation',
    subtitle: 'Grand ceremony',
    description: 'Ceremonial portrait in cathedral-like setting with royal insignia.',
    prompt:
      'Royal coronation portrait, ceremonial robes, ornate cathedral interior, golden emblems, epic yet refined composition, photorealistic detail',
    animationPrompt: 'Slow majestic camera push with glowing stained-glass light and subtle robe motion',
    exampleImageUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/5f/Jacques-Louis_David%2C_The_Coronation_of_Napoleon_edit.jpg',
    photoCost: ROYAL_PHOTO_COST,
    videoCost: ROYAL_VIDEO_COST,
    tags: ['ceremony', 'cathedral', 'epic'],
  },
];

const ROYAL_STYLE_PREVIEW_IMAGES: Record<string, ImageSourcePropType> = {
  'the-queen': queenPreview,
  'the-diamond': diamondPreview,
  'the-duke': dukePreview,
  'garden-soiree': gardenSoireePreview,
  'midnight-court': midnightCourtPreview,
  'the-heiress': heiressPreview,
  'regency-masquerade': regencyMasqueradePreview,
  'the-coronation': coronationPreview,
};

export const getStylePreviewSource = (style: RoyalStylePreset): ImageSourcePropType =>
  ROYAL_STYLE_PREVIEW_IMAGES[style.id] ?? { uri: style.exampleImageUrl };

export const ROYAL_STYLE_PRESETS_BY_ID = Object.fromEntries(
  ROYAL_STYLE_PRESETS.map((style) => [style.id, style]),
) as Record<string, RoyalStylePreset>;
