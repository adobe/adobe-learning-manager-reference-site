/***
 *
 * Please Do not use this Component.
 */
import styles from "./styles/SideBar.module.css";
import Globe from "@spectrum-icons/workflow/Globe";
import Article from "@spectrum-icons/workflow/Article";
import SectionLine from "./SectionLine";
import { LEADERBOARD, SKILLS, FAVOURITES, FOLLOW } from "../../utils/constants";
import { getALMObject } from "../../utils/global";
import { useIntl } from "react-intl";
import { Grid, View } from "@adobe/react-spectrum";
import { useEffect } from "react";
const BoardHtml = (props: any) => {
  const { formatMessage } = useIntl();
  const loadMyBoardsPage = (status: boolean) => {
    const ele1 = document.getElementById("gridElement1") as HTMLDivElement;
    const ele2 = document.getElementById("gridElement2") as HTMLDivElement;

    if (status) {
      ele1.classList.add(styles.hovered);
      ele2.classList.remove(styles.hovered);
    } else {
      ele2.classList.add(styles.hovered);
      ele1.classList.remove(styles.hovered);
    }

    props.loadMyBoards(status);
  };
  useEffect(() => {
    loadMyBoardsPage(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const keyPressHandle = (e: any, status: boolean) => {
    if (e.code === "Enter") {
      loadMyBoardsPage(status);
    }
  };
  return (
    <>
      <Grid areas={["header", "left", "right"]}>
        <View gridArea="header">
          <div className={styles.title2}>
            {formatMessage({
              id: "alm.text.boards",
              defaultMessage: "BOARDS",
            })}{" "}
          </div>
        </View>

        <View gridArea="left">
          <Grid
            areas={["header header"]}
            columns={[".35fr", "1fr"]}
            UNSAFE_className={`${styles.pointer}`}
            id="gridElement1"
          >
            <div className={`${styles.primeBoardIcon}`} onClick={() => loadMyBoardsPage(true)}>
              {" "}
              <Article />{" "}
            </div>

            <div onClick={() => loadMyBoardsPage(true)} tabIndex={0}>
              {formatMessage({
                id: "alm.text.myBoards",
                defaultMessage: "My Boards",
              })}{" "}
            </div>
          </Grid>
        </View>
        <View gridArea="right">
          <Grid
            areas={["header header"]}
            columns={[".35fr", "1fr"]}
            UNSAFE_className={`${styles.pointer} `}
            id="gridElement2"
          >
            <div className={`${styles.primeBoardIcon}`} onClick={() => loadMyBoardsPage(false)}>
              {" "}
              <Globe />{" "}
            </div>
            <div onClick={() => loadMyBoardsPage(false)} tabIndex={0}>
              {formatMessage({
                id: "alm.text.allBoards",
                defaultMessage: "all Boards",
              })}
            </div>
          </Grid>
        </View>
      </Grid>
    </>
  );
};

const LeftSideBar = (props: any) => {
  const { formatMessage } = useIntl();

  const FavHtml = (props: any) => {
    const alm = getALMObject();
    return (
      <>
        <Grid areas={["header"]}>
          <View gridArea="header">
            <div className={styles.title}>
              {" "}
              {formatMessage({
                id: "alm.text.favourites",
                defaultMessage: "Favorites",
              })}
            </div>
          </View>

          {props.favBoards.map((item: any) => {
            return (
              <div
                key={item.name}
                className={`${styles.pointer} ${styles.favArea}`}
                role="link"
                onClick={() => {
                  alm.navigateToBoardDetailsPage(item.id);
                }}
              >
                <SectionLine title={item.name} type={FAVOURITES} />
              </div>
            );
          })}
        </Grid>
      </>
    );
  };
  return (
    <>
      <div className={styles.leftSideBar}>
        <BoardHtml loadMyBoards={props.loadMyBoards} />
        <hr />
        <FavHtml favBoards={props.favBoards} />
        <hr />
      </div>
    </>
  );
};
export default LeftSideBar;
