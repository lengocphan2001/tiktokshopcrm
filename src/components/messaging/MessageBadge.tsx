'use client';

import * as React from 'react'
import { Badge, BadgeProps } from '@mui/material'

interface MessageBadgeProps {
  unreadCount: number
  children: React.ReactNode
  color?: BadgeProps['color']
  max?: number
}

export const MessageBadge: React.FC<MessageBadgeProps> = ({
  unreadCount,
  children,
  color = 'error',
  max = 99,
}) => {
  return (
    <Badge
      badgeContent={unreadCount}
      color={color}
      max={max}
      invisible={unreadCount === 0}
    >
      {children}
    </Badge>
  )
} 