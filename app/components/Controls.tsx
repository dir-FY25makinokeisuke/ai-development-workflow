// 操作説明コンポーネント

export const Controls = () => {
  return (
    <div className="bg-gray-800 rounded-2xl shadow-2xl p-6">
      <h2 className="text-xl font-bold text-white mb-4">操作方法</h2>
      <div className="space-y-2 text-sm text-gray-300">
        <p>
          <span className="text-blue-400 font-medium">←/→</span> : 左右移動
        </p>
        <p>
          <span className="text-blue-400 font-medium">↓</span> : ソフトドロップ
        </p>
        <p>
          <span className="text-blue-400 font-medium">↑</span> : 回転
        </p>
        <p>
          <span className="text-blue-400 font-medium">スペース</span> : ハードドロップ
        </p>
        <p>
          <span className="text-blue-400 font-medium">P</span> : 一時停止
        </p>
      </div>
    </div>
  );
};
