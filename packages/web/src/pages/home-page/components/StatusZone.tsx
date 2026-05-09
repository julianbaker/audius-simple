import { Flex } from '@audius/harmony'

import { QuickLinks } from './QuickLinks'

type StatusZoneProps = {
  variant: 'desktop' | 'mobile'
}

export const StatusZone = (_props: StatusZoneProps) => {
  return (
    <Flex column gap='l' w='100%'>
      <QuickLinks />
    </Flex>
  )
}
