import React, { useState, useRef } from 'react';
import { useSpring, useChain, animated, config } from 'react-spring';
import { getCardImage } from '../utils/getCardImage';

const Card = ({ className, card, index, isSelected, handleSelectCard, startWidth, startHeight, scaleUpFactor, transform, imageClass}) => {
  const [isHovering, setHover] = useState(false);

  const posRef = useRef();
  const posProps= useSpring({
    ref: posRef,
    to: isHovering ? { zIndex: 1 } : { zIndex: 0 },
    immediate: true
  });

  const transformHover = transform && transform.hover && transform.noHover ? transform.hover : "scale(2) translateY(-25%)";
  const transformNoHover = transform && transform.hover && transform.noHover ? transform.noHover : "scale(1) translateY(0%)";
  const transformSelected = transform && transform.selected ? transform.selected : "scale(1) translateY(-10%)";
  const width = startWidth ? startWidth : null;
  const height = startHeight ? startHeight : null;
  const scaleDirectHover = height ? { height: `${height * scaleUpFactor}vh` } : width ? { width: `${width * scaleUpFactor}vw` } : {};
  const scaleDirectNoHover = height ? { height: `${height}vh` } : width ? { width: `${width}vw` } : {};

  const sizeRef = useRef();
  const sizeProps = useSpring({
    ref: sizeRef,
    to: isHovering ? { ...scaleDirectHover, transform: `${transformHover}` }
                   : { ...scaleDirectNoHover, transform: `${isSelected && transformSelected ? transformSelected : transformNoHover}` },
    config: config.default,
    delay: isHovering ? 400 : 0
  });

  useChain([posRef, sizeRef]);

  const finalClassName = className ? className : "card-playable";

  return (
      <animated.div
        className={finalClassName}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{...posProps, ...sizeProps, position: "relative"}}
        key={index}
        onClick={() => handleSelectCard(index)}
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