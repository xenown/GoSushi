import React, { useState, useRef } from 'react';
import { useSpring, useChain, animated, config } from 'react-spring';
import { getCardImage } from '../utils/getCardImage';

const Card = ({ className, card, index, isSelected, played, handleSelectCard, scaleUpFactor, transform, imageClass}) => {
  const [isHovering, setHover] = useState(false);

  const posRef = useRef();
  const posProps= useSpring({
    ref: posRef,
    to: isHovering ? { zIndex: 1 } : { zIndex: 0 },
    immediate: true
  });

  const transformHover = transform && transform.hover && transform.noHover ? transform.hover : "translateY(-25%)";
  const transformNoHover = transform && transform.hover && transform.noHover ? transform.noHover : "translateY(0%)";
  const transformSelected = transform && transform.selected ? transform.selected : "translateY(-10%)";
  const sizeRef = useRef();
  const sizeProps = useSpring({
    ref: sizeRef,
    to: isHovering ? { transform: `scale(${scaleUpFactor}) ${transformHover}` } : { transform: `scale(1) ${isSelected ? transformSelected : transformNoHover}` },
    config: config.default
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
        disabled={played}
        onClick={handleSelectCard ? () => handleSelectCard(index) : () => {}}
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