import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import {
  SphereGeometry,
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  Vector3,
  LineBasicMaterial,
  BufferGeometry,
  Line,
  MeshBasicMaterial,
  Mesh,
  Raycaster,
  Vector2,
} from "three";
import { RestAdapter } from "../../../utils/restAdapter";
import { GetTranslation } from "../../../utils/translationService";
import SpriteText from "three-spritetext";
import styles from "./ExternalSkillGraphComponent.module.css";
import { getALMAccount, getALMConfig } from "../../../utils/global";
import { useEffect, useRef } from "react";
import loadingImage from "../../../assets/images/LoadingButton.gif";
import { RESET_ICON_SVG } from "../../../utils/inline_svg";
const TWEEN = require("@tweenjs/tween.js").default;

const ExternalSkillGraphComponent = (props: any) => {
  const MIN_CHARACTERS_TO_TRIGGER_SEARCH = 2;
  const MAX_SEARCH_OPTIONS_TO_SHOW = 5;
  const textLimit = 20;
  const width = 800;
  const height = 450;

  const CAMERA_Y_AXIS = 30000;
  const SCALE_FACTOR = 10;
  const RADIUS = 17000;
  const VICINITY_AREA_RANGE = 2000;
  const TEXT_HEIGHT = 2000;

  const CAMERA_Y_AXIS_SECONDARY = 10000;
  const SCALE_FACTOR_SECONDARY = 5;
  const RADIUS_SECONDARY = 5000;
  const VICINITY_AREA_RANGE_SECONDARY = 2000;
  const TEXT_HEIGHT_SECONDARY = 1000;

  const SPRITE_TEXT_POSITION = 200;
  const SCROLL_ELEMENTS_LIMIT = 6;

  let scene = new Scene();
  let tween = new TWEEN.Tween();
  let camera = new PerspectiveCamera(75, width / height, 0.1, 10000000000000);
  let oldCamera = new PerspectiveCamera(75, width / height, 0.1, 10000000000000);
  let renderer = new WebGLRenderer();
  let selectedNodeColor = "0xFFFFFF";
  let edgesColor = "white";
  let intervalTimer = null as any;
  let currentFocussedNode = undefined as any;
  let currentHoveredNode = undefined as any;
  let randomlySelectedNode = undefined as any;

  let isPaginated = null as any;
  let isNavigatingCamera = null as any;
  let rotationEnabled = true;

  let i = 0;
  let angle = 0;
  let graph_thunder_effect_count = 0;

  let nodes = new Map(); //[key=nodeId, value=node]
  let mainNodes = new Map(); //[key=nodeId, value=node]
  let nodesInVicinity = new Map(); //[key=nodeId, value=node]
  let clusters = new Map(); //[key=clusterId, value=nodeList]
  let labels = new Map(); //[key=nodeId, value=labelObject]
  let currentNodeList = new Map(); //[key=nodeId, value=node]
  let hiddenNodeList = new Map(); //[key=nodeId, value=node]

  let objects = [] as any;
  let edges = [] as any;
  let nearByClusterIds = [] as any;
  let nearByClusterIdsOld = [] as any;
  let selectedNodes = [] as any;

  let animate = null as any;
  let frameId = null as any;
  let raycaster = null as any;

  let ALL_ACCOUNTS = true; //default value of checkbox
  let FIRST_LOAD = true;
  let userExploreWorkflow = false;
  let currentFocus = -1;

  let controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.075; // friction
  controls.rotateSpeed = 0.075; // mouse sensitivity
  controls.zoomSpeed = 0.075;

  let geometry = new SphereGeometry(50, 30, 30);
  let projector: any, INTERSECTED: any;

  const GRAPH_AREA = useRef(null);
  const skillInputElement = useRef(null);
  const searchBoxElement = useRef(null);
  const accountSpecificCheckboxElement = useRef(null);
  const loaderElement = useRef(null);

  useEffect(() => {
    if (renderer) {
      renderer.setSize(width, height);
      renderer.domElement.id = "3dgraph";
      (GRAPH_AREA.current as any).appendChild(renderer.domElement);
      fetchGraphData(ALL_ACCOUNTS, FIRST_LOAD);

      if (selectedNodes.length === 0) {
        showNoInterestSelectedMessage();
      }

      (accountSpecificCheckboxElement.current as any)?.addEventListener(
        "click",
        handleAccountSpecificCheckboxClick
      );

      document.addEventListener("mouseup", handleClickOutsideTypeahead);
      window.addEventListener("blur", function () {
        if (document.activeElement != document.getElementById("iframe")) {
          hideTypeahead();
        }
      });

      (skillInputElement.current as any).addEventListener("input", handleSkillInput);

      //removing a selected node
      let skillsArea = document.querySelector(`.${styles.selectedSkillsArea}`);
      skillsArea?.addEventListener("click", handleClickOnSkillsArea);
      skillsArea?.addEventListener("mousedown", event => event.preventDefault());
    }
  }, []);

  let getNode = function (nodeId: string) {
    return nodes.get(parseInt(nodeId));
  };

  let isNodePresent = function (nodeId: string) {
    return nodes.has(parseInt(nodeId));
  };

  let getNodePositionVector = function (nodeId: string) {
    let node = getNode(nodeId);
    return new Vector3(parseFloat(node.fx), parseFloat(node.fy), parseFloat(node.fz));
  };

  //needed for thundering effect of edges
  let getRandomKey = function (collection: any) {
    let keys = Array.from(collection.keys());
    return keys[Math.floor(Math.random() * keys.length)];
  };

  function drawLine(pointX: any, pointY: any) {
    let material = new LineBasicMaterial({
      color: edgesColor,
      opacity: 0.5,
      transparent: true,
    });
    let points = [];
    points.push(pointX);
    points.push(pointY);
    let geometry = new BufferGeometry().setFromPoints(points);
    let line = new Line(geometry, material);
    edges.push(line);
    scene.add(line);
  }

  let drawLinksForNode = function (node: any) {
    if (isNotNullAndUndefined(node)) {
      node.links.map((link: any) => {
        //if destination node in graph
        if (isNodePresent(link)) {
          drawLine(getNodePositionVector(node.id), getNodePositionVector(link));
        }
      });
    }
  };

  let hideLinksForAllNodes = function () {
    for (let element of edges) {
      scene.remove(element);
    }
    edges = [];
  };

  function clearAllObjectsFromScene() {
    objects = [];
  }

  function initGraphComponents() {
    scene = new Scene();
    tween = new TWEEN.Tween();
    camera = new PerspectiveCamera(75, width / height, 0.1, 10000000000000);
    renderer = new WebGLRenderer();
    renderer.setSize(width, height);
    renderer.domElement.id = "3dgraph";
    (GRAPH_AREA.current as any).appendChild(renderer.domElement);
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.075; // friction
    controls.rotateSpeed = 0.075; // mouse sensitivity
    controls.zoomSpeed = 0.075; // mouse sensitivity
    geometry = new SphereGeometry(50, 30, 30);
    // projector;
    // INTERSECTED;
    startGraphRotation();
  }

  function addNodesToClusterNodeList(node: any) {
    let nodesList = [];
    if (isNotNullAndUndefined(clusters.get(node.cluster))) {
      nodesList = clusters.get(node.cluster);
    }
    nodesList.push(node.id);
    clusters.set(node.cluster, nodesList);
  }

  function removeNodesFromClusterNodeList(node: any) {
    let nodeList = clusters.get(node.cluster);
    clusters.set(node.cluster, nodeList.splice(node.id, 1));
  }

  function readNodes(graph_data: any) {
    isPaginated = graph_data.is_paginated;
    let node_data = graph_data.nodes_data;

    node_data.map(function (node: any) {
      node = getFormattedNode(node);
      if (node.is_main === 1) {
        mainNodes.set(node.id, node);
      }
      nodes.set(node.id, node);
      addNodesToClusterNodeList(node);
    });

    for (let [, node] of nodes) {
      drawNode(node);
    }
  }

  function startGraphRotation() {
    rotationEnabled = true;
  }

  function stopGraphRotation() {
    rotationEnabled = false;
  }

  function setCameraPosition(x: number, y: number, z: number) {
    camera.position.x = x;
    camera.position.y = y;
    camera.position.z = z;
  }

  function setPreviousCameraPosition(x: number, y: number, z: number) {
    oldCamera.position.x = x;
    oldCamera.position.y = y;
    oldCamera.position.z = z;
  }

  function onGraphData(graphData: any) {
    readNodes(graphData);
    let cameraAxis = ALL_ACCOUNTS ? CAMERA_Y_AXIS : CAMERA_Y_AXIS_SECONDARY;
    setCameraPosition(0, cameraAxis, 0);
    setPreviousCameraPosition(0, cameraAxis, 0);
    raycaster = new Raycaster();

    animate = function () {
      tween.update();
      frameId = requestAnimationFrame(animate);
      if (rotationEnabled) {
        rotate();
      } else {
        stationary();
      }
      camera.lookAt(scene.position);
      renderer.render(scene, camera);
      controls.update();
      TWEEN.update();
    };
    animate();
    addListenerForCanvasRotation();
    addListenerForNodes();
  }

  function rotate() {
    let radius = ALL_ACCOUNTS ? RADIUS : RADIUS_SECONDARY;
    angle += 0.001;
    camera.position.x = radius * Math.sin(angle);
    camera.position.z = radius * Math.cos(angle);
    camera.lookAt(scene.position);
  }

  function stationary() {
    angle += 0.0;
  }

  function addNodeLabel(node: any, height = undefined as any) {
    if (isNullOrUndefined(node)) {
      return;
    }
    if (isNullOrUndefined(labels.get(node.id))) {
      let sprite = new SpriteText(`${node.name}`);
      let calculatedHeight =
        calculateDistanceFromCamera(node) / 25 < 60 ? 60 : calculateDistanceFromCamera(node) / 25;
      sprite.color = "lightgray";
      sprite.textHeight = isNotNullAndUndefined(height)
        ? height
        : isCurrentFocussedNode(node)
          ? 60
          : calculatedHeight;
      sprite.position.x = node.fx;
      sprite.position.y = node.fy - SPRITE_TEXT_POSITION;
      sprite.position.z = node.fz;
      labels.set(node.id, sprite);
      scene.add(sprite);
    }
  }

  function removeNodeLabel(node: any) {
    scene.remove(labels.get(node.id));
    labels.delete(node.id);
    nodesInVicinity.delete(node.id);
    currentHoveredNode = undefined;
  }

  function addNodeLabels() {
    getNodesInVicinity();
    for (let [, node] of nodesInVicinity) {
      if (isNullOrUndefined(labels.get(node.id))) {
        addNodeLabel(node);
      } else {
        removeNodeLabel(node);
        addNodeLabel(node);
      }
    }
    setLabelColor(currentFocussedNode, "blue");
  }

  function setLabelColor(node: any, color: string) {
    if (isNotNullAndUndefined(node)) {
      let label = labels.get(node.id);
      if (isNotNullAndUndefined(label)) {
        label.backgroundColor = color;
      }
    }
  }

  function setCurrentFocussedNode(node: any) {
    setLabelColor(currentFocussedNode, ""); //clear previously higlighted label
    currentFocussedNode = node;
  }

  function isCurrentFocussedNode(node: any) {
    if (isNullOrUndefined(currentFocussedNode)) return false;
    return node.id === currentFocussedNode.id;
  }

  function moveCameraToNode(node: any) {
    isNavigatingCamera = true;
    controls.enabled = false;
    var duration = 2000;
    const distRatio = 1 + 500 / Math.hypot(node.fx, node.fy, node.fz);
    var targetPosition = new Vector3(node.fx * distRatio, node.fy * distRatio, node.fz * distRatio);
    var position = new Vector3().copy(camera.position);
    setCurrentFocussedNode(node);

    new TWEEN.Tween(position)
      .to(targetPosition, duration)
      .easing(TWEEN.Easing.Quartic.InOut)
      .onUpdate(function () {
        camera.position.copy(position);
        camera.lookAt(node);
      })
      .onComplete(function () {
        camera.position.copy(targetPosition);
        camera.lookAt(node);
        controls.enabled = true;
        isNavigatingCamera = false;
      })
      .start();
  }

  function calculateDistanceFromCamera(node: any) {
    let diffX, diffY, diffZ;
    diffX = camera.position.x - node.fx;
    diffY = camera.position.y - node.fy;
    diffZ = camera.position.z - node.fz;
    return Math.hypot(diffX, diffY, diffZ);
  }

  function calculateDistanceBetweenCameraMovement() {
    let diffX, diffY, diffZ;
    diffX = camera.position.x - oldCamera.position.x;
    diffY = camera.position.y - oldCamera.position.y;
    diffZ = camera.position.z - oldCamera.position.z;
    return Math.hypot(diffX, diffY, diffZ);
  }

  function updateNodesInVicinityMap() {
    let vicinityAreaRange = ALL_ACCOUNTS ? VICINITY_AREA_RANGE : VICINITY_AREA_RANGE_SECONDARY;
    for (let [, node] of nodesInVicinity) {
      if (calculateDistanceFromCamera(node) > vicinityAreaRange) {
        removeNodeLabel(node);
      }
    }
  }

  function getNodesInVicinity() {
    updateNodesInVicinityMap();
    let vicinityAreaRange = ALL_ACCOUNTS ? VICINITY_AREA_RANGE : VICINITY_AREA_RANGE_SECONDARY;
    for (let [, node] of nodes) {
      if (
        calculateDistanceFromCamera(node) < vicinityAreaRange &&
        isNullOrUndefined(nodesInVicinity.get(node.id))
      ) {
        nodesInVicinity.set(node.id, node);
      }
    }
  }

  function reverseRotation() {
    rotationEnabled = !rotationEnabled;
    if (!rotationEnabled) {
      hideLinksForAllNodes();
    }
  }

  function addListenerForCanvasRotation() {
    let element = document.querySelector("canvas");
    element?.addEventListener("contextmenu", reverseRotation);
    element?.addEventListener("touchstart", reverseRotation);
    element?.addEventListener("mouseover", stopGraphRotation);
  }

  function isNodeConnected(nodeA: any, nodeB: any) {
    nodeA.links.map((link: any) => {
      if (link === nodeB.id) {
        currentNodeList.set(nodeB.id, nodeB);
        return true;
      }
    });
    return false;
  }

  function hideNonRelatedNodes(currentNode: any) {
    if (isNullOrUndefined(currentNodeList.get(currentNode))) {
      currentNodeList.set(currentNode.id, currentNode);
      removeNodeFromHiddenList(currentNode);
    }
    for (let [, node] of nodes) {
      if (
        !isNodeConnected(currentNode, node) &&
        node.cluster != currentNode.cluster &&
        isNullOrUndefined(currentNodeList.get(node.id))
      ) {
        removeNodeFromGraph(node);
        addNodeToHiddenNodeList(node);
      } else {
        if (isNullOrUndefined(currentNodeList.get(node))) {
          currentNodeList.set(node.id, node);
          removeNodeFromHiddenList(node);
        }
      }
    }
  }

  function addNodeToHiddenNodeList(node: any) {
    if (isNullOrUndefined(hiddenNodeList.get(node))) {
      hiddenNodeList.set(node.id, node);
    }
  }

  function removeNodeFromHiddenList(node: any) {
    if (!isNullOrUndefined(hiddenNodeList.get(node.id))) {
      hiddenNodeList.delete(node.id);
    }
  }

  function clearHiddenNodeList() {
    hiddenNodeList.clear();
  }

  function clearCurrentNodeList() {
    currentNodeList.clear();
  }

  function showAllHiddenNodes() {
    for (let [, node] of hiddenNodeList) {
      addNodeToGraph(node);
    }
    hiddenNodeList.clear();
    userExploreWorkflow = false;
  }

  function handleClickOnCanvas(event: any) {
    let mouse = new Vector2();
    mouse.x =
      ((event.clientX - renderer.domElement.offsetLeft) / renderer.domElement.width) * 2 - 1;
    mouse.y =
      -((event.clientY - renderer.domElement.offsetTop) / renderer.domElement.height) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    let intersects = raycaster.intersectObjects(objects, true);
    INTERSECTED = undefined;
    if (intersects.length > 0) {
      if (intersects[0].object != INTERSECTED) {
        if (INTERSECTED) {
          INTERSECTED.material.color.setHex(INTERSECTED.currentHex);
        }
        INTERSECTED = intersects[0].object;
        rotationEnabled = false;
        let nodeId = INTERSECTED.name;
        let node = getNode(nodeId);
        if (selectedNodes.indexOf(nodeId) > -1) {
          //element already selected, unselect it
          hideLinksForAllNodes();
          removeNodeFromSelectionList(node);
          let oldColor = "0x" + node.color.split("#")[1];
          setNodeColor(INTERSECTED, oldColor);
        } else {
          setNodeColor(INTERSECTED, selectedNodeColor);
          moveCameraToNode(node);
          hideLinksForAllNodes();
          drawLinksForNode(node);
          addNodeToSelectedList(node);
          hideNonRelatedNodes(node);
        }
      }
    }
    controls.update();
    return false;
  }

  function handleMouseOverOnCanvas(event: any) {
    let mouse = new Vector2();
    mouse.x =
      ((event.clientX - renderer.domElement.offsetLeft) / renderer.domElement.width) * 2 - 1;
    mouse.y =
      -((event.clientY - renderer.domElement.offsetTop) / renderer.domElement.height) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    let intersects = raycaster.intersectObjects(objects, true);
    INTERSECTED = undefined;
    if (intersects.length > 0) {
      if (intersects[0].object != INTERSECTED) {
        if (INTERSECTED) {
          INTERSECTED.material.color.setHex(INTERSECTED.currentHex);
        }
        INTERSECTED = intersects[0].object;
        rotationEnabled = false;
        let nodeId = INTERSECTED.name;
        currentHoveredNode = getNode(nodeId);
        addNodeLabel(currentHoveredNode);
      }
    } else {
      if (isNotNullAndUndefined(currentHoveredNode)) removeNodeLabel(currentHoveredNode);
    }
    controls.update();
    return false;
  }

  function addListenerForNodes() {
    let canvasElement = document.querySelector("canvas");
    canvasElement?.addEventListener("click", handleClickOnCanvas);
    canvasElement?.addEventListener("touchstart", handleClickOnCanvas);
    canvasElement?.addEventListener("mousemove", handleMouseOverOnCanvas);
  }

  function startIntervalTimer() {
    intervalTimer = setInterval(() => {
      if (rotationEnabled) {
        if (graph_thunder_effect_count % 4) {
          let NumOfNodes = nodes.size;
          let activatedNodes = [];
          for (i = 0; i < Math.min(10, NumOfNodes); i++) {
            activatedNodes.push(nodes.get(getRandomKey(nodes)));
          }
          hideLinksForAllNodes();
          if (isNotNullAndUndefined(randomlySelectedNode)) removeNodeLabel(randomlySelectedNode);
          randomlySelectedNode = activatedNodes[0];
          let textHeight = ALL_ACCOUNTS ? TEXT_HEIGHT : TEXT_HEIGHT_SECONDARY;
          addNodeLabel(randomlySelectedNode, textHeight);
          for (let element of activatedNodes) {
            drawLinksForNode(element);
          }
        }
        graph_thunder_effect_count = (graph_thunder_effect_count + 1) % 32;
      }

      if (!rotationEnabled && !isNavigatingCamera) {
        addNodeLabels();
        if (isPaginated) {
          let vicinityAreaRange = ALL_ACCOUNTS
            ? VICINITY_AREA_RANGE
            : VICINITY_AREA_RANGE_SECONDARY;
          if (calculateDistanceBetweenCameraMovement() > vicinityAreaRange) {
            getAllNodesBelongingToNearbyClusters();
            // removeNonMainNodesFromFarClusters();
            setPreviousCameraPosition(camera.position.x, camera.position.y, camera.position.z);
          }
        }
      }
    }, 750);
  }

  function stopIntervalTimer() {
    clearInterval(intervalTimer);
  }

  async function getAllNodesBelongingToNearbyClusters() {
    nearByClusterIds = [];
    let vicinityAreaRange = ALL_ACCOUNTS ? VICINITY_AREA_RANGE : VICINITY_AREA_RANGE_SECONDARY;
    for (let [, node] of mainNodes) {
      if (calculateDistanceFromCamera(node) < vicinityAreaRange) {
        nearByClusterIds.push(node.cluster);
      }
    }

    if (nearByClusterIdsOld.length === 0) {
      nearByClusterIdsOld = nearByClusterIds;
    } else {
      for (let i = 0; i < nearByClusterIds.length; i++) {
        if (nearByClusterIdsOld.indexOf(nearByClusterIds[i]) > -1) {
          //cluster already loaded
          nearByClusterIds.splice(nearByClusterIds[i], 1);
        }
      }
    }

    let body = { cluster_ids: nearByClusterIds };
    let headers = { "content-type": "application/json" };
    if (nearByClusterIds.length > 0) {
      let result = (await RestAdapter.ajax({
        url: `${getALMConfig().primeApiURL}/cc/get_nodes_by_cluster`,
        method: "POST",
        body: JSON.stringify(body),
        headers: headers,
      })) as any;
      let node_data = JSON.parse(result).nodes_data;
      node_data.map(function (node: any) {
        node = getFormattedNode(node);
        if (!isNodePresent(node.id)) {
          if (node.is_main === 1) {
            mainNodes.set(node.id, node);
          }
          nodes.set(node.id, node);
          addNodesToClusterNodeList(node);
          drawNode(node);
          currentNodeList.set(node.id, node);
        }
      });
      drawLinksForNode(currentFocussedNode);
      nearByClusterIdsOld = nearByClusterIds;
    }
  }

  // function removeNonMainNodesFromFarClusters() {
  //     for (let [clusterId, clusterNodeList] of clusters) {
  //         //if cluster not nearby
  //         if (!nearByClusterIds.includes(clusterId)) {
  //             let newNodesList = [];
  //             for (let nodeId of clusterNodeList) {
  //                 let node = getNode(nodeId);
  //                 if (node.is_main != 1 && selectedNodes.indexOf(node.id) <= -1 && calculateDistanceFromCamera(node) > vicinityAreaRange) {
  //                     removeNodeFromGraph(node);
  //                     if (nearByClusterIdsOld.indexOf(node.cluster) > -1) {
  //                         nearByClusterIdsOld.splice(node.cluster, 1);
  //                     }
  //                 } else {
  //                     newNodesList.push(node.id);
  //                 }
  //             }
  //             clusters.set(clusterId, newNodesList);
  //         }
  //     }
  // }

  function createSkillBox(node: any) {
    let truncatedName = node.name;
    if (node.name.length > textLimit) {
      truncatedName = node.name.substr(0, textLimit) + "...";
    }

    let element = document.querySelector(`.${styles.selectedSkillsArea}`);
    let skillBox = document.createElement("span");
    skillBox.id = node.id;
    skillBox.setAttribute("automationid", node.name);
    skillBox.className = styles.selectedSkill;
    skillBox.setAttribute("title", node.name);
    skillBox.setAttribute("tabindex", "0");

    let closeButton = document.createElement("button");
    closeButton.className = styles.closeButton;
    closeButton.id = "remove-" + node.id;
    closeButton.setAttribute("automationid", `remove-${node.name}`);
    skillBox.innerHTML = truncatedName;
    skillBox.appendChild(closeButton);
    element?.appendChild(skillBox);
  }

  function removeSkillBox(nodeId: string) {
    let skillBox = document.getElementById(nodeId);
    if (isNotNullAndUndefined(skillBox)) {
      skillBox?.remove();
    }
  }

  function updateSelectedSkillCount() {
    let selectedCountElement = document.querySelector(`.${styles.selectedCount}`);
    if (isNotNullAndUndefined(selectedCountElement)) selectedCountElement?.remove();

    if (selectedNodes.length > 0) {
      let selectedSkillsHeadingElement = document.querySelector(`.${styles.selectedSkillsHeading}`);
      selectedCountElement = document.createElement("span");
      selectedCountElement.className = styles.selectedCount;
      selectedCountElement.innerHTML = " - " + selectedNodes.length;
      selectedSkillsHeadingElement?.appendChild(selectedCountElement);
    }
  }

  function showResetGraphIcon() {
    if (userExploreWorkflow === false) {
      userExploreWorkflow = true;
      let resetButton = document.createElement("button");
      resetButton.className = styles.resetGraph;
      resetButton.setAttribute("title", GetTranslation("alm.showAllSkillsMessage", true));
      resetButton.innerHTML = RESET_ICON_SVG();
      (GRAPH_AREA.current as any).appendChild(resetButton);
      resetButton.addEventListener("click", handleResetButtonClick);
    }
  }

  function setSelectedSkillsToParentFrame() {
    props.setSelectedExternalInterest(selectedNodes);
  }

  function addNodeBoxInUi(node: any) {
    selectedNodes.push(node.id);
    if (selectedNodes.length > SCROLL_ELEMENTS_LIMIT) {
      let skillsArea = document.querySelector(`.${styles.selectedSkillsArea}`);
      if (skillsArea) {
        skillsArea.className = `${styles.selectedSkillsArea} ${styles.showScrollbar}`;
      }
    }
    hideNoInterestSelectedMessage();
    createSkillBox(node);
    updateSelectedSkillCount();
  }

  function addNodeToSelectedList(node: any) {
    addNodeBoxInUi(node);
    showResetGraphIcon();
    setSelectedSkillsToParentFrame();
  }

  function handleResetButtonClick() {
    showAllHiddenNodes();
    hideResetGraphIcon();
  }

  function removeNodeFromSelectionList(node: any) {
    selectedNodes.splice(selectedNodes.indexOf(node.id), 1);
    if (selectedNodes.length < SCROLL_ELEMENTS_LIMIT) {
      let skillsArea = document.querySelector(`.${styles.selectedSkillsArea}`);
      if (skillsArea) {
        skillsArea.className = styles.selectedSkillsArea;
      }
    }
    removeSkillBox(node.id);
    updateSelectedSkillCount();
    setSelectedSkillsToParentFrame();
  }

  function clearSelectedNodes() {
    for (let nodeId of selectedNodes) {
      removeSkillBox(nodeId);
    }
    selectedNodes = [];
    updateSelectedSkillCount();
    showNoInterestSelectedMessage();
  }

  function setNodeColor(element: any, color: string) {
    element.material.color.setHex(color);
  }

  function isEmptyString(value: string) {
    return value === "";
  }

  function getNodeId(event: any) {
    let parent = event.target.parentElement;
    if (parent.tagName.toLowerCase() === "svg") {
      let element = parent.parentElement;
      return element.id;
    } else if (parent.className === "closeButton") {
      return parent.id;
    }
    return "";
  }

  function handleClickOnSkillsArea(event: any) {
    let nodeId = isEmptyString(event.target.id) ? getNodeId(event) : event.target.id;
    if (nodeId.includes("remove-")) {
      let node = getNode(nodeId.split("remove-")[1]);
      removeNodeFromSelectionList(node);
      let oldColor = "0x" + node.color.split("#")[1];
      let element = getObject(node.id);
      setNodeColor(element, oldColor);
      if (selectedNodes.length === 0) {
        showNoInterestSelectedMessage();
      }
    } else if (!isEmptyString(nodeId)) {
      let node = getNode(nodeId);
      moveCameraToNode(node);
      hideLinksForAllNodes();
      drawLinksForNode(node);
    }
  }

  function getObject(nodeId: string) {
    for (let element of objects) {
      if (element.name === parseInt(nodeId)) {
        return element;
      }
    }
    return undefined;
  }

  function showNoInterestSelectedMessage() {
    let emptyMessageElement = document.querySelector(`.${styles.emptyMessage}`);
    if (isNullOrUndefined(emptyMessageElement)) {
      let selectedSkillsArea = document.querySelector(`.${styles.selectedSkillsArea}`);
      emptyMessageElement = document.createElement("span");
      emptyMessageElement.className = styles.emptyMessage;
      emptyMessageElement.setAttribute("automationid", "primelxpSkillsEmptyMessage");
      emptyMessageElement.innerHTML = GetTranslation("alm.noExternalInterestSelectedMessage", true);
      selectedSkillsArea?.appendChild(emptyMessageElement);
    }
  }

  function hideNoInterestSelectedMessage() {
    let emptyMessageElement = document.querySelector(`.${styles.emptyMessage}`);
    if (isNotNullAndUndefined(emptyMessageElement)) {
      emptyMessageElement?.remove();
    }
  }

  function showSearchLoader() {
    let typeaheadElement = document.getElementById("typeahead");
    let searchLoaderElement = document.createElement("img");
    searchLoaderElement.className = styles.searchLoader;
    searchLoaderElement.src = loadingImage;
    typeaheadElement?.appendChild(searchLoaderElement);
  }

  function hideSearchLoader() {
    let searchLoaderElement = document.querySelector(`.${styles.searchLoader}`);
    if (isNotNullAndUndefined(searchLoaderElement)) {
      searchLoaderElement?.remove();
    }
  }

  function clearSearchInput() {
    if (isNotNullAndUndefined(skillInputElement.current)) {
      (skillInputElement.current as any).value = "";
    }
  }

  function getSearchInputValue() {
    if (isNotNullAndUndefined(skillInputElement.current)) {
      return (skillInputElement.current as any).value;
    }
    return "";
  }

  function removeActiveClass(element: HTMLElement) {
    if (element) {
      element.className = styles.suggestion;
    }
  }

  function addActiveClass(element: HTMLElement) {
    if (element) {
      element.className = `${styles.suggestion} ${styles.active}`;
    }
  }

  function setSearchInputValue(element: HTMLElement) {
    (skillInputElement.current as any).value = element.innerHTML;
  }

  function handleKeydown(event: any) {
    let e = event || window.event;
    const key = e.which || e.keyCode || 0;
    if (key === 38) {
      //arrowup
      let suggestionElements = document.querySelectorAll(`.${styles.suggestion}`);
      if (currentFocus != -1) {
        removeActiveClass(suggestionElements[currentFocus] as HTMLElement);
      } else {
        currentFocus = 0;
      }
      currentFocus = currentFocus === 0 ? suggestionElements.length - 1 : currentFocus - 1;
      addActiveClass(suggestionElements[currentFocus] as HTMLElement);
      setSearchInputValue(suggestionElements[currentFocus] as HTMLElement);
    } else if (key === 40) {
      //arrowdown
      let suggestionElements = document.querySelectorAll(`.${styles.suggestion}`);
      if (currentFocus > -1) removeActiveClass(suggestionElements[currentFocus] as HTMLElement);
      currentFocus = currentFocus === suggestionElements.length - 1 ? 0 : currentFocus + 1;
      addActiveClass(suggestionElements[currentFocus] as HTMLElement);
      setSearchInputValue(suggestionElements[currentFocus] as HTMLElement);
    } else if (key === 13 && currentFocus != -1) {
      //enter
      let suggestionElements = document.querySelectorAll(`.${styles.suggestion}`);
      selectNode(suggestionElements[currentFocus].id);
    }
  }

  function showTypeahead() {
    let typeaheadElement = document.createElement("div");
    typeaheadElement.id = "typeahead";
    typeaheadElement.className = styles.typeahead;
    (searchBoxElement.current as any).appendChild(typeaheadElement);
    currentFocus = -1;
  }

  function addNoResultMessage() {
    let typeaheadElement = document.getElementById("typeahead") as HTMLElement;
    let noResultElement = document.createElement("div");
    noResultElement.className = styles.noSuggestion;
    noResultElement.innerHTML = GetTranslation("alm.noSearchResultsMessage");
    typeaheadElement.appendChild(noResultElement);
  }

  function removeNoResultMessage() {
    let noResultElement = document.querySelector(`.${styles.noSuggestion}`);
    if (isNotNullAndUndefined(noResultElement)) {
      noResultElement?.remove();
    }
  }

  function addSuggestion(id: string, name: string) {
    let typeaheadElement = document.getElementById("typeahead") as HTMLElement;
    let suggestionElement = document.createElement("div");
    suggestionElement.className = styles.suggestion;
    suggestionElement.id = id;
    suggestionElement.innerHTML = name;
    typeaheadElement.appendChild(suggestionElement);
  }

  function selectNode(nodeId: string) {
    if (isNotNullAndUndefined(nodeId)) {
      let selectedNode = getNode(nodeId);
      stopGraphRotation();
      //node not present loaded
      if (isNullOrUndefined(selectedNode)) {
        fetchAndLoadNodeData(nodeId);
      } else {
        let object = getObject(nodeId);
        setNodeColor(object, selectedNodeColor);
        moveCameraToNode(selectedNode);
        if (selectedNodes.indexOf(nodeId) <= -1) {
          addNodeToSelectedList(selectedNode);
          makeNodeAsMain(selectedNode);
        }
        hideLinksForAllNodes();
        drawLinksForNode(selectedNode);
        hideTypeahead();
        hideNonRelatedNodes(selectedNode);
      }
      clearSearchInput();
    }
  }

  function handleSearchSuggestionClick(event: any) {
    selectNode(event.target.id);
  }

  //search part
  async function search() {
    let searchUrl =
      getALMConfig().primeApiURL +
      "/search?filter.loTypes=skill&state=active&sort=name&type=skill&filter.skill.type=external&query=" +
      getSearchInputValue();
    if (ALL_ACCOUNTS) {
      searchUrl += "&filter.skill.external.all=true";
    }

    hideTypeahead();
    showTypeahead();
    showSearchLoader();

    let result = (await RestAdapter.ajax({
      url: searchUrl,
      method: "GET",
    })) as any;

    let parsedResponse = JSON.parse(result);
    let itemCount =
      parsedResponse.data.length <= MAX_SEARCH_OPTIONS_TO_SHOW
        ? parsedResponse.data.length
        : MAX_SEARCH_OPTIONS_TO_SHOW;

    hideSearchLoader();
    hideTypeahead();
    showTypeahead();
    removeNoResultMessage();

    if (itemCount === 0) {
      addNoResultMessage();
      return;
    }

    for (let i = 0; i < itemCount; i++) {
      let nodeId = parsedResponse.data[i].id.includes("external:")
        ? parsedResponse.data[i].id.split("external:")[1]
        : parsedResponse.data[i].id;
      addSuggestion(nodeId, parsedResponse.data[i].attributes.name);
    }

    let suggestionElement = document.querySelector(`.${styles.suggestion}`);
    if (isNotNullAndUndefined(suggestionElement)) {
      let typeaheadElement = document.getElementById("typeahead");
      typeaheadElement?.addEventListener("click", handleSearchSuggestionClick);
      typeaheadElement?.addEventListener("mouseover", clearCurrentFocus);
    }
  }

  function clearCurrentFocus() {
    let suggestionElements = document.querySelectorAll(`.${styles.suggestion}`);
    removeActiveClass(suggestionElements[currentFocus] as any);
    currentFocus = -1;
  }

  //hide typeahead on click outside div
  function handleClickOutsideTypeahead(event: any) {
    let typeaheadElement = document.getElementById("typeahead");
    if (isNotNullAndUndefined(typeaheadElement) && !typeaheadElement?.contains(event.target))
      typeaheadElement?.remove();
  }

  function makeNodeAsMain(node: any) {
    node.is_main = 1;
    if (isNullOrUndefined(mainNodes.get(node.id))) mainNodes.set(node.id, node);
  }

  function hideTypeahead() {
    let suggestionElement = document.querySelector(`.${styles.suggestion}`);
    let typeaheadElement = document.getElementById("typeahead");
    if (isNotNullAndUndefined(suggestionElement)) {
      suggestionElement?.remove();
    }
    if (isNotNullAndUndefined(typeaheadElement)) {
      typeaheadElement?.remove();
    }
  }

  function isNullOrUndefined(value: any) {
    return value === null || value === undefined;
  }

  function isNotNullAndUndefined(value: any) {
    return !isNullOrUndefined(value);
  }

  function showLoader() {
    if (loaderElement.current) {
      (loaderElement.current as any).className = `${styles.loader} ${styles.visible}`;
    }
  }

  function hideLoader() {
    if (loaderElement.current) {
      (loaderElement.current as any).className = styles.loader;
    }
  }

  function hideResetGraphIcon() {
    let resetGraphButton = document.querySelector(`.${styles.resetGraph}`);
    if (isNotNullAndUndefined(resetGraphButton)) {
      resetGraphButton?.remove();
    }
  }

  function resetUserExploreWorkflow() {
    userExploreWorkflow = false;
  }

  function clearGraph() {
    nodes = new Map();
    mainNodes = new Map();
    animate = null;
    scene = null as any;
    projector = null;
    camera = null as any;
    controls = null as any;
    clearAllObjectsFromScene();
    let canvasElement = document.querySelector("canvas");
    canvasElement?.removeEventListener("contextmenu", {} as any);
    canvasElement?.removeEventListener("touchstart", {} as any);
    canvasElement?.removeEventListener("click", {} as any);
    document.getElementById("3dgraph")?.remove();
    hideResetGraphIcon();
    resetUserExploreWorkflow();
    clearHiddenNodeList();
    clearCurrentNodeList();
  }

  async function fetchGraphData(allAccounts: boolean, firstLoad: boolean) {
    let params = {} as any;
    if (!allAccounts) {
      let account = await getALMAccount();
      params["account_id"] = account.id;
    }
    showLoader();
    let result = (await RestAdapter.ajax({
      url: `${getALMConfig().primeApiURL}/cc/init_external_skill_graph`,
      method: "GET",
      params: params,
    })) as any;
    hideLoader();
    // let result = {"nodes_data": [[35085,"Sports biomechanics",13,49.67,2221.71,403.3,1,"#db6257",[20601,20010,20020,27297,20022,20050,20032,23030,20352,20029,20337,20341,20602,20356,27832,20600,20018,20336,24489,20323,21334,20042,20334,20088,20040]],[32817,"Fungus",29,-942.83,401.84,1408.95,1,"#db6657",[22207,22208,22685,22740,20018,20730,21023,22728,21025,20042,24086,20050,20020,20010,22216,20047,22453,22206,21030,20022,20029,24570,21457,23895,20032,20088,20735]],],"is_paginated": 1};
    onGraphData(JSON.parse(result));
    // onGraphData(result);
    startIntervalTimer();

    if (firstLoad && isNotNullAndUndefined(props.selectedExternalSkills)) {
      for (let nodeId of props.selectedExternalSkills) {
        let node = getNode(nodeId);
        if (isNullOrUndefined(node)) {
          let result = (await RestAdapter.ajax({
            url: `${getALMConfig().primeApiURL}/cc/get_node_meta?node_id=${nodeId}`,
            method: "GET",
          })) as any;
          node = getFormattedNode(JSON.parse(result).nodes_data);
          addNodeToGraph(node);
          makeNodeAsMain(node);
        }
        addNodeBoxInUi(node);
        let object = getObject(node.id);
        setNodeColor(object, selectedNodeColor);
      }
    }
  }

  function getFormattedNode(node: any) {
    let formattedNode = {} as any;
    let scaleFactor = ALL_ACCOUNTS ? SCALE_FACTOR : SCALE_FACTOR_SECONDARY;
    formattedNode.id = node[0];
    formattedNode.name = node[1];
    formattedNode.cluster = node[2];
    formattedNode.fx = node[3];
    formattedNode.fy = node[4];
    formattedNode.fz = node[5];
    formattedNode.is_main = node[6];
    formattedNode.color = node[7];
    formattedNode.links = node[8];
    formattedNode.fx = formattedNode.fx * scaleFactor;
    formattedNode.fy = formattedNode.fy * scaleFactor;
    formattedNode.fz = formattedNode.fz * scaleFactor;
    return formattedNode;
  }

  async function fetchAndLoadNodeData(nodeId: string) {
    let result = (await RestAdapter.ajax({
      url: `${getALMConfig().primeApiURL}/cc/get_node_meta?node_id=${nodeId}`,
      method: "GET",
    })) as any;
    let node = getFormattedNode(JSON.parse(result).nodes_data);

    addNodeToGraph(node);
    makeNodeAsMain(node);

    //Focus and Select the node
    let object = getObject(node.id);
    setNodeColor(object, selectedNodeColor);
    moveCameraToNode(node);

    //if not already selected
    if (selectedNodes.indexOf(node.id) <= -1) {
      addNodeToSelectedList(node);
    }
    hideLinksForAllNodes();
    drawLinksForNode(node);
    hideNonRelatedNodes(node);
    hideTypeahead();
    return node;
  }

  function addNodeToGraph(node: any) {
    nodes.set(node.id, node);
    addNodesToClusterNodeList(node);
    drawNode(node);
  }

  function drawNode(node: any) {
    let material = new MeshBasicMaterial({
      color: node.color,
      wireframe: false,
      transparent: true,
      depthWrite: false,
    });
    let sphere = new Mesh(geometry, material);
    sphere.position.x = parseFloat(node.fx);
    sphere.position.y = parseFloat(node.fy);
    sphere.position.z = parseFloat(node.fz);
    sphere.name = node.id;
    scene.add(sphere);
    objects.push(sphere);
  }

  function removeNodeFromGraph(node: any) {
    let object = getObject(node.id);
    objects.splice(objects.indexOf(object), 1);
    scene.remove(object);
    scene.remove(labels.get(node.id));
    nodes.delete(node.id);
    nodesInVicinity.delete(node.id);
    labels.delete(node.id);
    removeNodesFromClusterNodeList(node);
  }

  function handleAccountSpecificCheckboxClick() {
    stopIntervalTimer();
    cancelAnimationFrame(frameId);
    clearGraph();
    clearSelectedNodes();
    ALL_ACCOUNTS = !(accountSpecificCheckboxElement.current as any).checked;
    fetchGraphData(ALL_ACCOUNTS, !FIRST_LOAD);
    initGraphComponents();
  }

  async function handleSkillInput() {
    let value = (skillInputElement.current as any).value;
    if (
      isNullOrUndefined(value) ||
      isEmptyString(value) ||
      value.length < MIN_CHARACTERS_TO_TRIGGER_SEARCH
    ) {
      hideTypeahead();
      return;
    }
    await search();
  }

  return (
    <>
      <div className={styles.frame}>
        <div className={styles.topOptions}>
          <span
            className={styles.search}
            id="searchBox"
            role="search"
            aria-label={GetTranslation("alm.skillSearchPlaceholder", true)}
            ref={searchBoxElement}
            onKeyDown={handleKeydown}
          >
            <input
              type="search"
              id="skillInput"
              automation-id="skillInput"
              className={styles.skillInput}
              autoComplete="off"
              placeholder={GetTranslation("alm.skillSearchPlaceholder", true)}
              ref={skillInputElement}
            />
          </span>
          <span className={styles.graphHeading}>{GetTranslation("alm.skillMapHeading", true)}</span>
        </div>
        <div id="loader" ref={loaderElement} className={styles.loader}></div>
        <div
          id="graph-area"
          ref={GRAPH_AREA}
          className={styles.graphArea}
          automation-id="graph-area"
        ></div>
        <div className={styles.checkboxRow}>
          <label htmlFor="accountSpecificCheckbox">
            <input
              id="accountSpecificCheckbox"
              automation-id="accountSpecificCheckbox"
              className={styles.accountSpecificCheckbox}
              type="checkbox"
              ref={accountSpecificCheckboxElement}
            />
            <span className={styles.setting} automation-id="showExternalSkills">
              {GetTranslation("alm.externalSkillCheckboxLabel", true)}
            </span>
          </label>
        </div>
        <div className={styles.selectedSkills}>
          <div
            id="selectedSkillsHeading"
            automation-id="selectedSkillsHeading"
            className={styles.selectedSkillsHeading}
          >
            <span automation-id="selectedSkills">
              {GetTranslation("alm.selectedSkillsHeading", true)}
            </span>
          </div>
          <div className={styles.selectedSkillsArea}></div>
        </div>
      </div>
    </>
  );
};

export default ExternalSkillGraphComponent;
