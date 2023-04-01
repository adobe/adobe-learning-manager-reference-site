import React, { useState, useEffect } from "react";
import {
  EMPTY_STAR_SVG,
  FULL_STAR_SVG,
  HALF_STAR_SVG,
} from "../../utils/inline_svg";
import styles from "./ALMStarRating.module.css";
import { useIntl } from "react-intl";

interface ratingProps {
  avgRating?: number;
  ratingGiven?: number;
  ratingsCount?: number;
  submitRating?: any;
}

const ALMRatingsComponent = (props: ratingProps) => {
  const { formatMessage } = useIntl();

  const {
    avgRating,
    ratingsCount,
    ratingGiven = -1,
    submitRating = () => {},
  } = props;
  const initialRating = ratingGiven ? ratingGiven : 0;

  const [hover, setHover] = useState(initialRating);
  const [editStars, setEditStars] = useState(true);

  const [numFullStars, setNumFullStars] = useState(0);
  const [numHalfStars, setNumHalfStars] = useState(0);
  const [numEmptyStars, setNumEmptyStars] = useState(5);

  const [template, setTemplate] = useState<any[]>([]);

  useEffect(() => {
    if (ratingGiven !== -1) {
      submitRating(ratingGiven);
    }

    if (avgRating === 0 || avgRating) {
      setEditStars(false);

      if (avgRating !== 0) {
        let flagHalfStar = false;

        submitRating(avgRating);
        setNumFullStars(Math.floor(avgRating));

        const decimalRating = avgRating - Math.floor(avgRating);
        if (decimalRating > 0.8) {
          setNumFullStars(Math.floor(avgRating) + 1);
        } else if (decimalRating > 0.2) {
          setNumHalfStars(1);
          flagHalfStar = true;
        }
        let halfStar = flagHalfStar ? 1 : 0;
        setNumEmptyStars(numEmptyStars - Math.floor(avgRating) - halfStar);
      }
    }
  }, [avgRating, ratingGiven]);

  useEffect(() => {
    const template = [];
    let nFullStars = numFullStars;
    let nHalfStars = numHalfStars;
    let nEmptyStars = numEmptyStars;

    while (nFullStars > 0) {
      nFullStars--;
      template.push(FULL_STAR_SVG());
    }

    while (nHalfStars > 0) {
      nHalfStars--;
      template.push(HALF_STAR_SVG());
    }

    while (nEmptyStars > 0) {
      nEmptyStars--;
      template.push(EMPTY_STAR_SVG());
    }
    setTemplate(template);
  }, [numFullStars, numHalfStars, numEmptyStars]);

  const avgRatingStars = () => {
    return template.map((star) => {
      let i = 0;
      return (
        <div className={styles.starRating} key={i++}>
          <span>{star}</span>
        </div>
      );
    });
  };

  const avgRatingRender = () => {
    return (
      <div
        title={formatMessage(
          { id: "alm.text.avgRatingLabel" },
          {
            averageRating: avgRating,
            ratingsCount: ratingsCount,
          }
        )}
        role="img"
        className={styles.overviewAvgRating}
        aria-label={formatMessage(
          { id: "alm.text.avgRatingLabel" },
          {
            averageRating: avgRating,
            ratingsCount: ratingsCount,
          }
        )}
      >
        <div aria-hidden="true">
          {avgRatingStars()}
          <p className={styles.averageRatingCount}>{ratingsCount}</p>
        </div>
      </div>
    );
  };

  const noRating = () => {
    return (
      <div className={styles.noRating}>
        {formatMessage({
          id: "alm.catalog.card.noRating",
        })}
      </div>
    );
  };

  const displayRating = () => {
    if (avgRating === 0) {
      return noRating();
    }
    if (avgRating) {
      return avgRatingRender();
    }
    if (!avgRating && ratingGiven === -1) {
      return <></>;
    }
    if (editStars) {
      return [...Array(5)].map((star, i) => {
        const index = i + 1;
        return (
          <div
            role="radiogroup"
            tabIndex={0}
            className={styles.givenRatingStars}
            onClick={() => submitRating(index)}
            onMouseEnter={() => setHover(index)}
            onMouseLeave={() => setHover(ratingGiven)}
            key={index}
          >
            <span>{index <= hover ? FULL_STAR_SVG() : EMPTY_STAR_SVG()}</span>
          </div>
        );
      });
    }
  };

  return <div>{displayRating()}</div>;
};

export default ALMRatingsComponent;
