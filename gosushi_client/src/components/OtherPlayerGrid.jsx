import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

import Card from './Card';
import OtherPlayerTile from './OtherPlayerTile';
import './otherPlayerGrid.scss';

const OtherPlayerGrid = ({ data }) => {
  const displayPlayedCard = (card, index) => (
    <Col key={`played_${card.name}_${index}`}>
      <Card 
        card={card}
        imageClass="card-image-other-players"
        scaleUpFactor={6}
      />
    </Col>
  );

  const displayPlayerData = player => (
    <Col>
      <OtherPlayerTile key={player.name} player={player} />
    </Col>
  );

  let numPerRow = 0;

  if (data.length > 0 && data.length <= 3) {
    numPerRow = data.length;
  } else if (data.length === 4 || data.length === 6) {
    numPerRow = data.length / 2;
  } else if (data.length === 5) {
    numPerRow = 3;
  } else {
    numPerRow = 4;
  }

  return (
    <Container>
      <Row xs={1} sm={2} md={numPerRow} noGutters>
        {data.map(displayPlayerData)}
      </Row>
    </Container>
  );
};

export default OtherPlayerGrid;
