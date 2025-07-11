import cn from 'classnames';

export const Character = () => {
  return (
    <Container className="p-6 bg-blue-400">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 전투력 */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-800 mb-4">전투 전투력</h3>
          <div className="text-3xl font-bold text-purple-600 mb-2">335,173,264</div>

          <div className="space-y-3 mt-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-red-500 rounded flex items-center justify-center">
                  <i className="ri-shield-line text-white text-sm"></i>
                </div>
                <div>
                  <div className="text-sm font-medium">침묵의 보스 세트</div>
                  <div className="text-xs text-gray-500">5</div>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center">
                  <i className="ri-sword-line text-white text-sm"></i>
                </div>
                <div>
                  <div className="text-sm font-medium">라이오스더 세트</div>
                  <div className="text-xs text-gray-500">2</div>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-yellow-500 rounded flex items-center justify-center">
                  <i className="ri-fire-line text-white text-sm"></i>
                </div>
                <div>
                  <div className="text-sm font-medium">에테르날 세트</div>
                  <div className="text-xs text-gray-500">7</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 장비 그리드 */}
        <div className="lg:col-span-2 bg-white rounded-lg p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-800">장비</h3>
            <div className="flex gap-2">
              <button className="px-3 py-1 bg-purple-600 text-white text-sm rounded">프리셋 1</button>
              <button className="px-3 py-1 bg-gray-200 text-gray-600 text-sm rounded">프리셋 2</button>
              <button className="px-3 py-1 bg-gray-200 text-gray-600 text-sm rounded">프리셋 3</button>
              <button className="px-3 py-1 bg-gray-800 text-white text-sm rounded">장비삭</button>
            </div>
          </div>

          <div className="grid grid-cols-8 gap-3">
            {Array.from({ length: 32 }, (_, i) => (
              <div
                key={i}
                className="aspect-square bg-gray-100 rounded-lg border-2 border-gray-200 flex items-center justify-center hover:border-purple-300 cursor-pointer"
              >
                {i < 16 && (
                  <div className="w-full h-full bg-gradient-to-br from-purple-400 to-blue-500 rounded-lg flex items-center justify-center">
                    <i className="ri-sword-line text-white text-lg"></i>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 상세 정보 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-800 mb-4">어센던트</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">AU1</span>
              <span className="font-medium">+60</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">STR</span>
              <span className="font-medium">+15,000</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">EXP</span>
              <span className="font-medium">+46%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">DROP/MESO</span>
              <span className="font-medium">+14%</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 text-white">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <i key={star} className="ri-star-fill text-yellow-400"></i>
              ))}
            </div>
            <h3 className="text-lg font-bold">에테르날 나이트메어 (+8)</h3>
          </div>

          <div className="text-sm text-blue-300 mb-4">(현신호의 아이템)</div>

          <div className="space-y-2 text-sm">
            <div>REQ LEVEL : 250</div>
            <div className="mt-4">
              <div>장비 부위: 양손</div>
              <div className="text-yellow-400">STR : +401 (50 +144 +49 +158)</div>
              <div className="text-yellow-400">DEX : +273 (50 +42 +22 +159)</div>
              <div className="text-yellow-400">INT : +232 (50 +42 +21 +119)</div>
              <div className="text-yellow-400">LUK : +193 (50 +24 +119)</div>
              <div className="text-green-400">HP : +255 (0 +255)</div>
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
};

function Container({ children, className, ...rest }: BaseComponentProps<'div'>) {
  return (
    <div className={cn('character_content_root', className)} {...rest}>
      {children}
    </div>
  );
}
