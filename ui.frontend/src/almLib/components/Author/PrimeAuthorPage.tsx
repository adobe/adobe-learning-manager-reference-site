/***
 *
 * Please Do not use this Component.
 */
import { Item, Picker, Provider, lightTheme } from "@adobe/react-spectrum";
import styles from "./PrimeAuthorPage.module.css";
import { useState } from "react";
import { TILE_VIEW, LIST_VIEW } from "../../utils/constants";
import ViewList from "@spectrum-icons/workflow/ViewList";
import ClassicGridView from "@spectrum-icons/workflow/ClassicGridView";
import { PrimeTrainingCard } from "../Catalog/PrimeTrainingCard";
import { PrimeTrainingList } from "../Catalog/PrimeTrainingList";
import { useIntl } from "react-intl";
import { useProfile } from "../../hooks";
import icon from "../../assets/images/back.svg";
import { useAuthor } from "../../hooks/author";

const PrimeAuthorPage = (props: any) => {
  const { trainings, loadMoreTraining, hasMoreItems } = useAuthor();
  const { formatMessage } = useIntl();
  const { profileAttributes } = useProfile();
  const { user } = profileAttributes;
  const setInitialView = () => {
    return window.localStorage.getItem("view") || TILE_VIEW;
  };

  const isListView = () => {
    return view === LIST_VIEW;
  };

  const [view, setView] = useState(setInitialView());

  const setCatalogView = (view: string) => {
    setView(view);
    window.localStorage.setItem("view", view);
  };

  const ToggleView = () => {
    return (
      <>
        {isListView() && (
          <div
            className={styles.viewButton}
            onClick={() => setCatalogView(TILE_VIEW)}
          >
            <ClassicGridView />
          </div>
        )}
        {!isListView() && (
          <div
            className={styles.viewButton}
            onClick={() => setCatalogView(LIST_VIEW)}
          >
            <ViewList />
          </div>
        )}
      </>
    );
  };

  const listHtml = trainings?.length ? (
    <ul
      className={
        isListView() ? styles.primeTrainingsList : styles.primeTrainingsCards
      }
    >
      {isListView() && <hr className={styles.primeVerticalSeparator}></hr>}
      {trainings?.map((training) =>
        isListView() ? (
          <PrimeTrainingList
            training={training}
            key={training.id}
          ></PrimeTrainingList>
        ) : (
          <PrimeTrainingCard
            training={training}
            key={training.id}
          ></PrimeTrainingCard>
        )
      )}
    </ul>
  ) : (
    <p className={styles.noResults}>
      {formatMessage({ id: "alm.catalog.no.result" })}
    </p>
  );

  return (
    <Provider theme={lightTheme} colorScheme="light">
      <div className={styles.dashboard}>
        <div className={styles.authorBox}>
          <div className={styles.profile}>
            <img className={styles.avatar} src={user.avatarUrl} alt="" />
            <div className={styles.about}>
              <span className={styles.authorName}>{user.name}</span>
              <span className={styles.designation}>
                {formatMessage({ id: "alm.text.author" })}
              </span>
              <span>
                {formatMessage({ id: "alm.author.trainings" }, { x: 173 })}
              </span>
            </div>
          </div>
        </div>
        <div className={styles.catalogContainer}>
          <div className={styles.back}>
            <button
              className={styles.btn}
              onClick={() => window.history.back()}
            >
              <img src={icon} className={styles.backIcon} alt="" />
              {formatMessage({ id: "alm.author.back.label" })}
            </button>
          </div>
          <div className={styles.left}>
            {formatMessage(
              { id: "alm.author.trainings.note" },
              { AuthorName: <b>{user.name}</b> }
            )}
          </div>
          <div className={styles.right}>
            <div className={styles.sort}>
              {formatMessage({ id: "alm.author.sortBy" })}
            </div>
            <div className={styles.picker}>
              <Picker
                defaultSelectedKey={formatMessage({
                  id: "alm.author.sort.recentlyPublished",
                })}
                UNSAFE_className={styles.pick}
              >
                <Item
                  key={formatMessage({
                    id: "alm.author.sort.recentlyPublished",
                  })}
                >
                  {formatMessage({ id: "alm.author.sort.recentlyPublished" })}
                </Item>
                <Item
                  key={formatMessage({
                    id: "alm.author.sort.nameAZ",
                  })}
                >
                  {formatMessage({ id: "alm.author.sort.nameAZ" })}
                </Item>
                <Item
                  key={formatMessage({
                    id: "alm.author.sort.nameZA",
                  })}
                >
                  {formatMessage({ id: "alm.author.sort.nameZA" })}
                </Item>
              </Picker>
            </div>
            <div className={styles.toggle}>
              <ToggleView />
            </div>
          </div>
          <div className={styles.top}>
            <div className={styles.primeTrainingsContainer}>
              {listHtml}
              <div
                id="load-more-trainings"
                className={styles.loadMoreContainer}
              >
                {hasMoreItems ? (
                  <button
                    onClick={loadMoreTraining}
                    className="almButton secondary"
                  >
                    {formatMessage({ id: "alm.community.loadMore" })}
                  </button>
                ) : (
                  ""
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Provider>
  );
};

export default PrimeAuthorPage;
