import React from 'react';
import { ColorType } from '../types.ts';

interface BallProps {
  number: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSpecular?: boolean;
  className?: string;
}

export const Ball: React.FC<BallProps> = ({
  number,
  size = 'md',
  showSpecular = true,
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6 text-xs font-bold',
    md: 'w-9 h-9 text-base font-extrabold',
    lg: 'w-12 h-12 text-xl font-black',
    xl: 'w-16 h-16 text-3xl font-black',
  };

  // Color mapping:
  // 0: Red + Violet (split)
  // 5: Green + Violet (split)
  // 1, 3, 7, 9: Green
  // 2, 4, 6, 8: Red
  const getColorClass = () => {
    if (number === 0) return 'bg-split-red-violet text-white';
    if (number === 5) return 'bg-split-green-violet text-white';
    if (number % 2 === 1) return 'bg-gradient-to-br from-[#2ed573] to-[#10ac84] text-white';
    return 'bg-gradient-to-br from-[#ff4757] to-[#ee5253] text-white';
  };

  return (
    <div
      className={`inline-flex items-center justify-center rounded-full ball-shadow ${
        showSpecular ? 'ball-specular' : ''
      } ${getColorClass()} ${sizeClasses[size]} ${className} font-rajdhani select-none transition-transform active:scale-95`}
    >
      <span className="relative z-10 drop-shadow-sm">{number}</span>
    </div>
  );
};

export const ColorDot: React.FC<{ color: ColorType; size?: 'sm' | 'md' }> = ({
  color,
  size = 'sm',
}) => {
  const sizeCls = size === 'sm' ? 'w-2.5 h-2.5' : 'w-3.5 h-3.5';
  const colorCls =
    color === 'green'
      ? 'bg-[#2ed573]'
      : color === 'red'
      ? 'bg-[#ff4757]'
      : 'bg-[#9c27b0]';

  return <span className={`inline-block rounded-full ${sizeCls} ${colorCls} shadow-sm`} />;
};
