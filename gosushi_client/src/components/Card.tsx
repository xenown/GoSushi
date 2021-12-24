import React, { useState } from 'react';
import { Spinner } from 'react-bootstrap';
import { useSpring, useSpringRef, useChain, animated, config } from '@react-spring/web';

import { getCardImage } from '../utils/getCardImage';
import ICard from '../types/ICard';

interface ICardHoverStyles {
  hover?: string;
  noHover?: string;
  hoverSelected?: string;
  noHoverSelected?: string;
  selected?: string;
};

interface ICardProps {
  className: string;
  card: ICard;
  index: number;
  isSelected: boolean;
  handleSelectCard: (index: number) => void;
  imageClass: string;
  scaleUpFactor?: number;
  startWidth?: number;
  startHeight?: number;
  transform?: ICardHoverStyles;
};

const Card = (
  {
    className,
    card,
    index,
    handleSelectCard,
    imageClass,
    isSelected,
    scaleUpFactor = 1,
    startWidth,
    startHeight,
    transform
  }: ICardProps
) => {
  const [hoverTimer, setHoverTimer] = useState<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [isHover, setHover] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  const posRef = useSpringRef();
  const posProps = useSpring({
    ref: posRef,
    to: isHover ? { zIndex: 1 } : { zIndex: 0 },
    immediate: true
  });

  const transformHover = transform?.hover && transform?.noHover ? transform.hover : "scale(2) translateY(-25%)";
  const transformNoHover = transform?.hover && transform?.noHover ? transform.noHover : "scale(1) translateY(0%)";
  const transformHoverSelected = transform?.hoverSelected || "scale(2) translateY(-35%)";
  const transformNoHoverSelected = transform?.noHoverSelected || "scale(1) translateY(-10%)";
  const width = startWidth;
  const height = startHeight;

  // eslint-disable-next-line
  const scaleDirectHover = height ? { height: `${height * scaleUpFactor}vh` } : width ? { width: `${width * scaleUpFactor}vw` } : {};
  // eslint-disable-next-line
  const scaleDirectNoHover = height ? { height: `${height}vh` } : width ? { width: `${width}vw` } : {};

  const sizeRef = useSpringRef();
  const sizeProps = useSpring({
    ref: sizeRef,
    to: { transform: isHover ? isSelected ? transformHoverSelected : transformHover : isSelected ? transformNoHoverSelected : transformNoHover },
    config: config.default
  });

  useChain([posRef, sizeRef]);

  const finalClassName = className ? className : "card-playable";
  return (
      <animated.div
        className={finalClassName}
        onMouseEnter={() => setHoverTimer(setTimeout(() => { setHover(true); }, 1000))}
        onMouseLeave={() => { hoverTimer && clearTimeout(hoverTimer); setHover(false); }}
        style={{...posProps, ...sizeProps, position: "relative"}}
        key={index}
        onClick={() => handleSelectCard(index)}
      >
        <img
          className={imageClass}
          onLoad={() => setImgLoaded(true)}
          src={getCardImage(card)}
          alt={card.name}
        />
        {!imgLoaded && <Spinner animation="border" variant="primary" />}
      </animated.div>
  );
};

export default Card;