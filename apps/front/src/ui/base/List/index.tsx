import React from 'react';

interface ListProps {
  children: React.ReactNode;
  ordered?: boolean;
  className?: string;
}

export function List({ children, ordered = false, className = '' }: ListProps) {
  const Tag = ordered ? 'ol' : 'ul';
  const listStyle = ordered ? 'list-decimal' : 'list-disc';
  return <Tag className={`${listStyle} list-inside ${className}`}>{children}</Tag>;
}

interface ListItemProps {
  children: React.ReactNode;
  className?: string;
}

export function ListItem({ children, className = '' }: ListItemProps) {
  return <li className={className}>{children}</li>;
}
