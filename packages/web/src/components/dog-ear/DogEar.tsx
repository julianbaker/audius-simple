import { DogEarType } from '@audius/common/models'
import {
  IconUserFollowing,
  IconLock,
  useTheme,
  ColorTheme,
  Box
} from '@audius/harmony'

import Rectangle from 'assets/img/dogEarRectangle.svg'

export type DogEarProps = {
  type: DogEarType
  /** Border width of container surrounding dog ear */
  borderOffset?: number
  className?: string
}

const getIcon = (type: DogEarType) => {
  switch (type) {
    case DogEarType.LOCKED:
      return IconLock
    case DogEarType.FOLLOW_GATED:
    default:
      return IconUserFollowing
  }
}

const getColor = (type: DogEarType, color: ColorTheme['day']) => {
  switch (type) {
    case DogEarType.FOLLOW_GATED:
    case DogEarType.LOCKED:
    default:
      return color.special.blue
  }
}

export const DogEar = (props: DogEarProps) => {
  const { type, className, borderOffset = 1 } = props
  const Icon = getIcon(type)
  const { spacing, color } = useTheme()
  const tagColor = getColor(type, color)

  return (
    <Box
      css={{
        position: 'absolute',
        top: -1 * borderOffset,
        left: -1 * borderOffset,
        zIndex: 10,
        overflow: 'hidden'
      }}
      borderTopLeftRadius='m'
      h='3xl'
      w='3xl'
      className={className}
    >
      <Rectangle
        css={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          color: tagColor
        }}
      />
      <Icon
        size='s'
        color='white'
        css={{ position: 'absolute', top: spacing.unit1, left: spacing.unit1 }}
      />
    </Box>
  )
}
