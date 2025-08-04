const [hand, setHand] = useState([]);
const [mana, setMana] = useState(1);

useEffect(() => {
  socket.emit('joinBattle', { userId: user?.id, deck });

  socket.on('battleReady', ({ hand, yourHp, enemyHp, mana }) => {
    setHand(hand);
    setYourHp(yourHp);
    setEnemyHp(enemyHp);
    setMana(mana);
  });
}, []);

<div className="flex gap-2 mt-4 justify-center">
  {hand.map((card, index) => (
    <CardSlot
      key={index}
      card={card}
      onPlay={(card) => handleCardPlay(card, index)}
    />
  ))}
</div>

const handleCardPlay = (card, index) => {
  socket.emit('playCard', { card });
  const newHand = [...hand];
  newHand.splice(index, 1); // remove card from hand
  setHand(newHand);
};


const [matchEnded, setMatchEnded] = useState(false);
const [matchResult, setMatchResult] = useState(null);

useEffect(() => {

  socket.on('matchEnd', ({ result }) => {
    setMatchEnded(true);
    setMatchResult(result); // 'win' or 'lose'
  });
}, []);

{matchEnded && (
  <div className="absolute inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center z-50">
    <h1 className="text-4xl mb-4 text-white font-bold">
      {matchResult === 'win' ? '🎉 You Win!' : '😞 You Lose'}
    </h1>
    <button
      onClick={() => window.location.reload()}
      className="bg-blue-600 text-white px-4 py-2 rounded-md"
    >
      Return to Lobby
    </button>
  </div>
)}


useEffect(() => {
  socket.on('enemyMove', ({ card, damage, yourHp }) => {
    setYourHp(yourHp);
    console.log(`Enemy played ${card.name}, hit you for ${damage}`);
  });

  return () => socket.off('enemyMove'); // clean up
}, []);

import PlayerInfo from '../components/PlayerInfo';
import EnemyInfo from '../components/EnemyInfo';


<><PlayerInfo username={user?.username} hp={yourHp} mana={mana} /><EnemyInfo name="AI Opponent" hp={enemyHp} /></>
import StatusPanel from '../components/StatusPanel';

<div className="flex justify-between w-full px-4 mt-4">
  <StatusPanel isPlayer={true} name={user?.username} hp={yourHp} mana={mana} />
  <StatusPanel isPlayer={false} name={enemyName} hp={enemyHp} />
</div>
