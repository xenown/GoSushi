import React, { useState, useRef } from 'react';
import { useSpring, useChain, animated, config } from 'react-spring';
import { getCardImage } from '../utils/getCardImage';

const Card = ({ className, card, index, isSelected, handleSelectCard, startWidth, startHeight, scaleUpFactor, transform, imageClass}) => {
  const [hoverTimer, setHoverTimer] = useState(null);
  const [isHover, setHover] = useState(false);

  const posRef = useRef();
  const posProps= useSpring({
    ref: posRef,
    to: isHover ? { zIndex: 1 } : { zIndex: 0 },
    immediate: true
  });

  const transformHover = transform && transform.hover && transform.noHover ? transform.hover : "scale(2) translateY(-25%)";
  const transformNoHover = transform && transform.hover && transform.noHover ? transform.noHover : "scale(1) translateY(0%)";
  const transformHoverSelected = transform && transform.hoverSelected ? transform.hoverSelected : "scale(2) translateY(-35%)";
  const transformNoHoverSelected = transform && transform.noHoverSelected ? transform.noHoverSelected : "scale(1) translateY(-10%)";
  const width = startWidth ? startWidth : null;
  const height = startHeight ? startHeight : null;
  const scaleDirectHover = height ? { height: `${height * scaleUpFactor}vh` } : width ? { width: `${width * scaleUpFactor}vw` } : {};
  const scaleDirectNoHover = height ? { height: `${height}vh` } : width ? { width: `${width}vw` } : {};

  const sizeRef = useRef();
  const sizeProps = useSpring({
    ref: sizeRef,
    to: { transform: isHover ? isSelected ? transformHoverSelected : transformHover : isSelected ? transformNoHoverSelected : transformNoHover },
    config: config.default
  });

  useChain([posRef, sizeRef]);

  const finalClassName = className ? className : "card-playable";
  const onClick = handleSelectCard ? handleSelectCard : () => {};
  return (
      <animated.div
        className={finalClassName}
        onMouseEnter={() => setHoverTimer(setTimeout(() => { setHover(true); }, 1000))}
        onMouseLeave={() => { clearTimeout(hoverTimer); setHover(false); }}
        style={{...posProps, ...sizeProps, position: "relative"}}
        key={index}
        onClick={() => onClick(index)}
      >
        <img
          className={imageClass}
          src={getCardImage(card)}
          alt={card.name}
        />
      </animated.div>
  );
};

export default Card;