import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faWeibo,
  faGithub,
  faLinkedin,
  faTwitter,
  faFacebook,
  faDribbble,
} from '@fortawesome/free-brands-svg-icons'
import {
  faEnvelope,
  faArrowUp,
  faHourglassStart,
  faHourglassHalf,
  faHourglassEnd,
} from '@fortawesome/free-solid-svg-icons'

interface FAProps {
  icon: string
  className?: string
}

export default function FA(props: FAProps) {

  const { icon, className } = props;

  const iconMap: {[KEY: string]: any} = {
    weibo: faWeibo,
    github: faGithub,
    linkedin: faLinkedin,
    envelope: faEnvelope,
    arrowUp: faArrowUp,
    hourglassStart: faHourglassStart,
    hourglassHalf: faHourglassHalf,
    hourglassEnd: faHourglassEnd,
    facebook: faFacebook,
    twitter: faTwitter,
    dribbble: faDribbble,
  }

  return (
    <FontAwesomeIcon className={`${className}`} icon={iconMap[icon]} />
  )
}
