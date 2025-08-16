import { UI, Cards, Sounds, Animations } from '../assets';

// Using UI elements
<div>
  <img src={UI.buttons.primary} alt="Primary Button" />
  {/* Using Card frames */}
  <img src={Cards.frames.legendary} alt="Legendary Frame" />
</div>

// Playing sounds
const audio = new Audio(Sounds.game.cardPlay);
audio.play();

// Using animations (if you're using Lottie or similar)
<Lottie animationData={Animations.effects.sparkle} />

// UI Elements
export const UI = {
  // Buttons
  buttons: {
    primary: require('./images/ui/buttons/primary.png'),
    secondary: require('./images/ui/buttons/secondary.png'),
  },
  // Icons
  icons: {
    gold: require('./images/ui/icons/gold.png'),
    energy: require('./images/ui/icons/energy.png'),
    trophy: require('./images/ui/icons/trophy.png'),
  },
  // Backgrounds
  backgrounds: {
    main: require('./images/ui/backgrounds/main.png'),
    battle: require('./images/ui/backgrounds/battle.png'),
  }
};

// Card Assets
export const Cards = {
  // Card frames
  frames: {
    common: require('./images/cards/frames/common.png'),
    rare: require('./images/cards/frames/rare.png'),
    epic: require('./images/cards/frames/epic.png'),
    legendary: require('./images/cards/frames/legendary.png'),
  },
  // Card backs
  backs: {
    default: require('./images/cards/backs/default.png'),
  }
};

// Sound Effects
export const Sounds = {
  ui: {
    click: require('./sounds/ui/click.mp3'),
    hover: require('./sounds/ui/hover.mp3'),
  },
  game: {
    cardPlay: require('./sounds/game/card-play.mp3'),
    victory: require('./sounds/game/victory.mp3'),
    defeat: require('./sounds/game/defeat.mp3'),
  }
};

// Animations
export const Animations = {
  effects: {
    sparkle: require('./animations/effects/sparkle.json'),
    explosion: require('./animations/effects/explosion.json'),
  },
  characters: {
    idle: require('./animations/characters/idle.json'),
    attack: require('./animations/characters/attack.json'),
  }
};

const handleCardClick = (card) => {
  // Play sound
  const audio = new Audio(Sounds.game.cardPlay);
  audio.play();
  
  // Show animation
  setActiveAnimation(Animations.effects.sparkle);
  
  // Perform game action
  playCard(card);
};

const handleButtonClick = () => {
  // Play click sound
  const audio = new Audio(Sounds.ui.click);
  audio.play();
  
  // Perform action
  handleAction();
};
