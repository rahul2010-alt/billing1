import React, { ReactNode } from 'react';

interface CardProps {
  title?: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
  footer?: ReactNode;
}

const Card: React.FC<CardProps> = ({ title, icon, children, className = '', footer }) => {
  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden ${className}`}>
      {(title || icon) && (
        <div className="px-6 py-4 border-b border-gray-200 flex items-center">
          {icon && <span className="mr-3 text-teal-600">{icon}</span>}
          {title && <h3 className="font-medium text-gray-900">{title}</h3>}
        </div>
      )}
      <div className="p-6">{children}</div>
      {footer && (
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;