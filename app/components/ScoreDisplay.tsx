// スコア表示コンポーネント

interface ScoreDisplayProps {
  score: number;
}

export const ScoreDisplay = ({ score }: ScoreDisplayProps) => {
  return (
    <div className="bg-gray-800 rounded-2xl shadow-2xl p-6">
      <h2 className="text-xl font-bold text-white mb-2">スコア</h2>
      <p className="text-4xl font-bold text-blue-400">{score}</p>
    </div>
  );
};
