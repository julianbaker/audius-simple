import { RefObject } from 'react'

import ContestPageContent from './components/desktop/ContestPage'

type ContestPageProps = {
  containerRef: RefObject<HTMLDivElement>
}

/**
 * Dedicated page for a remix contest. Replaces the in-line contest section
 * that used to live on the track page; the track page now links here via a
 * small "Contest running" CTA instead.
 *
 * The page is keyed by the same (handle, slug) pair as the parent track, but
 * hangs its data off the contest event_id rather than the track itself — this
 * is what lets comments and follows be scoped to the *event*, not the track.
 *
 * Single-implementation: the desktop content tree uses container queries to
 * adapt at narrow widths (see HEADER_STACK_BREAKPOINT_PX and
 * DETAILS_STACK_BREAKPOINT_PX in ContestPage.tsx), so the previously parallel
 * mobile variant is no longer needed.
 */
const ContestPage = ({ containerRef }: ContestPageProps) => {
  return <ContestPageContent containerRef={containerRef} />
}

export default ContestPage
