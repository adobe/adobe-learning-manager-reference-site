import { useMemo } from "react";
import { cardColors } from "../../common/theme"

const useCardBackgroundStyle = (training) => {
    const cardBackgroundStyle = useMemo(() => {
        if (!training) {
            return {}
        }
        if (training.almthumbnailurl) {
            return {
                backgroundImage: `url(${training.almthumbnailurl})`,
                backgroundSize: "cover",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center",
            }
        }
        //TO-DO pick from attributes or fall back to one default set of colors
        const themeColors = cardColors["prime-default"];
        const colorCode = training
            ? parseInt(training.almloid, 10) % 12
            : 0;
        const cardIconUrl = `https://cpcontents.adobe.com/public/images/default_card_icons/${colorCode}.svg`;
        return {
            background: `${themeColors[colorCode]} url(
                ${cardIconUrl}
            ) center center no-repeat`,
            backgroundSize: "50px",
        };
    }, [training]);

    return cardBackgroundStyle;
};

export {
    useCardBackgroundStyle
};