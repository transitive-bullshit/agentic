import { memo } from 'react'

const TitleComponent = ({
  title
}: {
  title: string
  type: string
  route: string
}) => {
  if (title === 'Guide' || title === 'Documentation') {
    return <b>{title}</b>
  }

  return <span>{title}</span>
}

export default memo(TitleComponent)
