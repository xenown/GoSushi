import React, { useState, useRef } from 'react';
import { useSpring, useChain, animated, config } from 'react-spring';
import { getCardImage } from '../utils/getCardImage';

const Card = ({ card, index, isSelected, played, handleSelectCard, scaleUpFactor, imageClass }) => {
  const [isHovering, setHover] = useState(false);

  const posRef = useRef();
  const posProps= useSpring({
    ref: posRef,
    from: { zIndex: 0 },
    to: isHovering ? { zIndex: 1 } : { zIndex: 0 },
    immediate: true
  });

  const sizeRef = useRef();
  const sizeProps = useSpring({
    ref: sizeRef,
    from: { transform: "scale(1) translateY(0px)" },
    to: isHovering ? { transform: `scale(${scaleUpFactor}) translateY(25%)` } : { transform: "scale(1) translateY(0px)" },
    config: config.default
  });

  useChain([posRef, sizeRef]);

  let className = 'card-playable';

  if (isSelected) {
    className += ' card-selected';
  }

  return (
    <div
      className={className}
      key={index}
      disabled={played}
      onClick={() => handleSelectCard(index)}
    >
      <animated.div
        className="card"
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{...posProps, ...sizeProps}}
      >
        <img
          className={imageClass}
          src={getCardImage(card)}
          alt={card.name}
        />
      </animated.div>
    </div>
  );
};

export default Card;