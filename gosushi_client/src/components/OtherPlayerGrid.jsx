import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

import Card from './Card';
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
    <Col key={player.name}>
      <div className="container-player-data">
        <span>{player.name}</span>
        <Container>
          <Row md={4} noGutters>
            {player.playedCards.map(displayPlayedCard)}
          </Row>
        </Container>
        <span>{`Points: ${player.points}`}</span>
      </div>
    </Col>
  );

  return (
    <Container>
      <Row xs={1} sm={2} md={4} noGutters>
        {data.map(displayPlayerData)}
      </Row>
    </Container>
  );
};

export default OtherPlayerGrid;
