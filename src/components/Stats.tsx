'use client';

import React from 'react';

export default function Stats() {
  return (
    <div className="relative py-20 overflow-hidden">
      {/* 上品な背景パターン */}
      <div className="absolute inset-0 bg-gradient-to-b from-white via-gray-50 to-white">
        <div className="absolute inset-0" style={{ 
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(239, 68, 68, 0.05) 1px, transparent 0)`,
          backgroundSize: `${1.618 * 16}px ${1.618 * 16}px`
        }}></div>
      </div>

      {/* メインコンテンツ */}
      <div className="relative max-w-7xl mx-auto px-4">
        {/* 装飾的なライン */}
        <div className="absolute left-0 right-0 h-px top-0 bg-gradient-to-r from-transparent via-red-100 to-transparent"></div>
        <div className="absolute left-0 right-0 h-px bottom-0 bg-gradient-to-r from-transparent via-red-100 to-transparent"></div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {[
            { number: '90', unit: '%', title: '退職交渉で', subtitle: 'トラブル発生' },
            { number: '3,000', unit: '件', title: '圧倒的な', subtitle: '解決実績' },
            { number: '98', unit: '%', title: '驚異的な', subtitle: '解決成功率' }
          ].map((stat, index) => (
            <div key={index} className="relative group">
              <div className="absolute inset-0 rounded-2xl bg-white shadow-[0_0_40px_rgba(0,0,0,0.03)] transition-all duration-500 group-hover:shadow-[0_0_60px_rgba(239,68,68,0.1)]"></div>
              
              <div className="relative p-8 text-center">
                {/* 数字部分 */}
                <div className="relative inline-block">
                  <div className="flex items-baseline justify-center">
                    <span className="text-6xl font-bold bg-gradient-to-r from-red-600 to-red-500 bg-clip-text text-transparent tracking-tight transition-transform duration-300 group-hover:scale-105">
                      {stat.number}
                    </span>
                    <span className="text-2xl font-medium text-red-500/80 ml-1">
                      {stat.unit}
                    </span>
                  </div>
                  {/* 装飾的なアクセント */}
                  <div className="absolute -right-4 top-1/2 -translate-y-1/2 w-px h-8 bg-gradient-to-b from-transparent via-red-200 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                  <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-px h-8 bg-gradient-to-b from-transparent via-red-200 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                </div>

                {/* テキスト部分 */}
                <div className="mt-6 space-y-1">
                  <div className="text-gray-600 font-medium tracking-wide transition-colors duration-300 group-hover:text-gray-900">
                    {stat.title}
                  </div>
                  <div className="text-red-600 font-bold tracking-wide transition-all duration-300 group-hover:text-red-500">
                    {stat.subtitle}
                  </div>
                </div>

                {/* ホバー時のアクセント */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-gradient-to-r from-red-500 to-red-400 rounded-t opacity-0 transform scale-x-0 transition-all duration-300 group-hover:opacity-100 group-hover:scale-x-100"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}