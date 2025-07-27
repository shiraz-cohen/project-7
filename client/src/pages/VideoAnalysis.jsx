import React, { useEffect, useState, useRef, useCallback } from "react";
import { loadImage } from "canvas";
import { useParams } from "react-router-dom";
var isSelecting = false;
var isDrawing = false;
const VideoAnalysis = () => {
  const [camera, setCamera] = useState({});
  const user = JSON.parse(localStorage.getItem("currentUser"));
  const { cameraID } = useParams();
  const [drawingMode, setDrawingMode] = useState(false);
  const [imageSrc, setImageSrc] = useState("");
  const canvasRef = useRef(null);
  const [clickPoints, setClickPoints] = useState([]);
  const [workplaces, setWorkplaces] = useState([]);
  const [descInput, setDescInput] = useState("");
  const [selectedPolygonIndex, setSelectedPolygonIndex] = useState(-1);
  const [deleteBtnDisabled, setDeleteBtnDisabled] = useState(true);
  const [selectModeBtnDisabled, setSelectModeBtnDisabled] = useState(false);
  const [drawModeBtnDisabled, setDrawModeBtnDisabled] = useState(false);
  const [selectModeBtnText, setSelectModeBtnText] =
    useState("Enter Select Mode");
  const [drawModeBtnText, setDrawModeBtnText] = useState("Exit Drawing Mode");
  const [selectModeBtnBackgroundColor, setSelectModeBtnBackgroundColor] =
    useState("");
  //const [isDrawing, setIsDrawing] = useState(false);
  //const [isSelecting, setIsSelecting] = useState(false);

  const [selectedVertexIndex, setSelectedVertexIndex] = useState(-1);

  const movePolygon = (e) => {
    if (isSelecting && selectedPolygonIndex !== -1) {
      const mouseX = e.clientX - canvasLeft + window.scrollX;
      const mouseY = e.clientY - canvasRight + window.scrollY;

      const deltaX = mouseX - canvasLeft;
      const deltaY = mouseY - canvasRight;

      const updatedPolygon = workplaces[selectedPolygonIndex].points.map(
        (point) => ({
          x: point.x + deltaX,
          y: point.y + deltaY,
        })
      );

      setWorkplaces((prevWorkplaces) => {
        const newWorkplaces = [...prevWorkplaces];
        newWorkplaces[selectedPolygonIndex] = {
          ...newWorkplaces[selectedPolygonIndex],
          points: updatedPolygon,
        };
        return newWorkplaces;
      });

      //renderWorkplaces();
    }
  };

  const moveVertex = (e) => {
    const canvas = canvasRef.current;
    const canvasLeft = canvas.getBoundingClientRect().left + window.scrollX;
    const canvasTop = canvas.getBoundingClientRect().top + window.scrollY;

    const mouseX = e.clientX - canvasLeft;
    const mouseY = e.clientY - canvasTop;

    if (selectedPolygonIndex !== -1 && selectedVertexIndex !== -1) {
      const newWorkplaces = [...workplaces];
      const selectedPolygon = newWorkplaces[selectedPolygonIndex];
      const selectedVertex = selectedPolygon.points[selectedVertexIndex];

      selectedVertex.x = mouseX;
      selectedVertex.y = mouseY;

      setWorkplaces(newWorkplaces);
      //renderWorkplaces();
    }
  };

  const handleDrawMode = () => {
    const canvas = canvasRef.current;
    //setIsDrawing((prevIsDrawing) => !prevIsDrawing);
    isDrawing = !isDrawing;
    if (isDrawing) {
      console.log("Entering Drawing Mode");
      setDrawModeBtnText("Exit Drawing Mode");
      setSelectModeBtnDisabled(true);
      setSelectModeBtnText("Enter Select Mode");
      //setIsSelecting(false);
      isSelecting = false;
      setSelectModeBtnBackgroundColor("");
      canvas.removeEventListener("mouseup", movePolygon);
      canvas.removeEventListener("mousemove", moveVertex);
      canvas.removeEventListener("mouseup", stopMovingVertex);
    } else {
      setDrawModeBtnText("Enter Drawing Mode");
      setSelectModeBtnDisabled(false);
    }
  };

  const stopMovingVertex = () => {
    canvasRef.current.removeEventListener("mousemove", moveVertex);
    canvasRef.current.removeEventListener("mouseup", stopMovingVertex);
  };

  const handleSelectMode = () => {
    const canvas = canvasRef.current;
    //setIsSelecting((prevIsSelecting) => !prevIsSelecting);
    isSelecting = !isSelecting;
    if (isSelecting) {
      setSelectModeBtnText("Exit Select Mode");
      setDrawModeBtnDisabled(true);
      //setDrawModeBtnText("Enter Drawing Mode");
      isDrawing = false;
      setSelectModeBtnBackgroundColor("");
      canvas.removeEventListener("mouseup", movePolygon);
      canvas.removeEventListener("mousemove", moveVertex);
      canvas.removeEventListener("mouseup", stopMovingVertex);
    } else {
      setSelectModeBtnText("Enter Select Mode");
      setDrawModeBtnDisabled(false);
    }
  };

  const handleDone = () => {
    setWorkplaces((prevWorkplaces) => [
      ...prevWorkplaces,
      {
        points: clickPoints,
        desc: descInput,
      },
    ]);
    console.log(workplaces);
    setClickPoints([]);
    setDescInput("");
    //renderWorkplaces();
  };

  const handleCancel = () => {
    setClickPoints([]);
    //renderWorkplaces();
  };

  const undo = () => {
    if (clickPoints.length > 0) {
      const newClickPoints = [...clickPoints];
      newClickPoints.pop();
      setClickPoints(newClickPoints);
      //renderWorkplaces();
      drawInsertedPolygon();
      drawInsertedPoints();
    }
  };

  const handleDelete = () => {
    if (isSelecting && selectedPolygonIndex !== -1) {
      setWorkplaces((prevWorkplaces) => {
        const newWorkplaces = [...prevWorkplaces];
        newWorkplaces.splice(selectedPolygonIndex, 1);
        return newWorkplaces;
      });
    }
    setSelectedPolygonIndex(-1);
    setDeleteBtnDisabled(true);
    //renderWorkplaces();
  };

  const handleSaveClick = () => {
    if (workplaces.length > 0 && workplaces[0].points.length > 0) {
      updatePolygons();
    } else {
      console.log("No data to save.");
    }
  };

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(
          `http://localhost:3000/cameraAPI/api/camera/${cameraID}`
        );
        if (response.status === 403) {
          const errorMessage = await response.json();
          alert(errorMessage);
          return;
        } else {
          const data = await response.json();
          setCamera(data[0]);
          setImageSrc(data[0].video);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }
    fetchData();
  }, [cameraID]);

  const loadAndDrawImage = useCallback(async () => {
    const canvas = canvasRef.current;

    if (!canvas) {
      console.error("Canvas reference is not available.");
      return;
    } else {
      console.log("work");
      console.log("isDrowing? ", isDrawing);
    }
    if (!camera.video) {
      console.error(" camera video is not available.");
      return;
    }

    console.log(canvas);
    console.log(canvasRef.current);

    if (!canvas) {
      console.error("Canvas reference is not available.");
      return;
    }

    const ctx = canvas.getContext("2d");
    // Ensure that camera.video is defined before attempting to load the image

    if (!camera.video) {
      console.error("Camera video is not available.");
      return;
    }

    try {
      const image = await loadImage(camera.video);
      // canvas.width = image.width;
      // canvas.height = image.height;
      //  canvas.width = 580;
      //  canvas.height = 350;
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

      var canvasLeft = canvas.getBoundingClientRect().left;
      var canvasRight = canvas.getBoundingClientRect().top;

      canvas.style.backgroundImage = `url("${camera.video}")`;
      canvas.style.backgroundSize = "cover";
      canvas.style.backgroundRepeat = "no-repeat";
      canvas.style.backgroundPosition = "center";

      canvas.addEventListener("mousedown", (e) => {
        e.preventDefault();
        e.stopPropagation();
        var BB = canvas.getBoundingClientRect();
        var offsetX = BB.left;
        var offsetY = BB.top;
        const mouseX = parseInt(e.clientX - offsetX);
        const mouseY = parseInt(e.clientY - offsetY);

        if (isDrawing) {
          setClickPoints((prevClickPoints) => [
            ...prevClickPoints,
            { x: Math.round(mouseX), y: Math.round(mouseY) },
          ]);
          console.log(clickPoints);
          //renderWorkplaces();
          drawInsertedPolygon();
          drawInsertedPoints();
        } else if (isSelecting) {
          //const ctx = canvas.getContext("2d");
          //ctx.beginPath();
          //ctx.arc(mouseX,mouseY,10, 0, 2 * Math.PI);
          //ctx.stroke();
          drawDot(mouseX, mouseY);
          const selectedPolygonIndex = getSelectedPolygonIndex(mouseX, mouseY);
          setSelectedPolygonIndex(selectedPolygonIndex);
          if (selectedPolygonIndex !== -1) {
            setDeleteBtnDisabled(false);
            setSelectModeBtnText("Exit Select Mode");
          } //  else {
          //   setSelectModeBtnText("Enter Select Mode");
          // }
        }
      });

      const drawPoly = (points, isSelected) => {
        ctx.lineWidth = isSelected ? 7 : 5;
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        points.slice(1).forEach((point) => {
          ctx.lineTo(point.x, point.y);
        });
        ctx.closePath();
        ctx.stroke();
      };

      const renderWorkplaces = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        workplaces.forEach((workplace, index) => {
          if (workplace.points.length > 2) {
            const isSelected = index === selectedPolygonIndex;
            drawPoly(workplace.points, isSelected);
          }
        });
      };

      const drawDot = (x, y) => {
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fillStyle = "red";
        ctx.fill();
        //ctx.closePath();
      };

      const drawInsertedPoints = () => {
        clickPoints.forEach((point) => {
          drawDot(point.x, point.y);
        });
      };

      // const drawInsertedPolygon = () => {
      //   if (clickPoints.length > 2) {
      //     drawPoly(clickPoints);
      //   }
      // };
      const drawInsertedPolygon = () => {
        if (clickPoints.length > 2) {
          const ctx = canvasRef.current.getContext("2d");
          ctx.beginPath();
          ctx.moveTo(clickPoints[0].x, clickPoints[0].y);

          for (let i = 1; i < clickPoints.length; i++) {
            ctx.lineTo(clickPoints[i].x, clickPoints[i].y);
          }

          // Connect the last point to the first point to close the polygon
          ctx.lineTo(clickPoints[0].x, clickPoints[0].y);

          ctx.closePath();
          ctx.stroke();
        }
      };

      // const updatePolygons = () => {

      // console.log("Polygons updated:", workplaces);
      // };

      const getSelectedPolygonIndex = (x, y) => {
        // Loop through workplaces array
        for (let i = 0; i < workplaces.length; i++) {
          const polygon = workplaces[i].points;

          // Check if the point (x, y) is inside the current polygon
          if (isPointInPolygon(x, y, polygon)) {
            return i; // Return the index of the selected polygon
          }
        }

        return -1; // Return -1 if no polygon is selected
      };
    } catch (error) {
      console.error("Error loading image:", error);
    }
  }, [
    cameraID,
    camera.video,
    clickPoints,
    workplaces,
    isDrawing,
    isSelecting,
    selectedPolygonIndex,
  ]);

  useEffect(() => {
    loadAndDrawImage();
  }, [loadAndDrawImage]);

  return (
    <div className="vid-container">
      {user && (
        <div className="background">
          <h3 className="cam-item">Location: {camera.location}</h3>
          <h4 className="cam-item">Junction: {camera.junction}</h4>
          {imageSrc && (
            <div>
              <div style={{ display: "flex", margin: "10px 0" }}>
                {/* <canvas ref={canvasRef}></canvas> */}

                {/* <input
                        type="text"
                        id="polygonDesc"
                        placeholder="desc"
                        value={descInput}
                        onChange={(e) => setDescInput(e.target.value)}
                      /> */}
              </div>
              <button onClick={handleDrawMode} disabled={drawModeBtnDisabled}>
                {drawModeBtnText}
              </button>
              <button
                onClick={handleSelectMode}
                disabled={selectModeBtnDisabled}
              >
                {selectModeBtnText}
              </button>
              <button onClick={handleDone}>Done</button>
              <button onClick={handleCancel}>Cancel</button>
              <button onClick={undo}>Undo</button>
              <button onClick={handleDelete} disabled={deleteBtnDisabled}>
                Delete
              </button>
              <button onClick={handleSaveClick}>Save</button>
              <br />
              <canvas
                ref={canvasRef}
                style={{ border: "1px solid black" }}
              ></canvas>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VideoAnalysis;

// import React, { useEffect, useState, useRef, useCallback } from "react";
// import { loadImage } from "canvas";
// import { useParams } from "react-router-dom";

// const VideoAnalysis = () => {
//   const [camera, setCamera] = useState({});
//   const user = JSON.parse(localStorage.getItem("currentUser"));
//   const { cameraID } = useParams();
//   const [drawingMode, setDrawingMode] = useState(false);
//   const [imageSrc, setImageSrc] = useState("");
//   const canvasRef = useRef(null);
//   const [clickPoints, setClickPoints] = useState([]);
//   const [workplaces, setWorkplaces] = useState([]);
//   const [descInput, setDescInput] = useState("");
//   const [selectedPolygonIndex, setSelectedPolygonIndex] = useState(-1);
//   const [deleteBtnDisabled, setDeleteBtnDisabled] = useState(true);
//   const [selectModeBtnDisabled, setSelectModeBtnDisabled] = useState(false);
//   const [drawModeBtnDisabled, setDrawModeBtnDisabled] = useState(false);
//   const [selectModeBtnText, setSelectModeBtnText] = useState("Enter Select Mode");
//   const [drawModeBtnText, setDrawModeBtnText] = useState("Exit Drawing Mode");
//   const [selectModeBtnBackgroundColor, setSelectModeBtnBackgroundColor] = useState("");
//   const [isDrawing, setIsDrawing] = useState(false);
//   const [isSelecting, setIsSelecting] = useState(false);
//   const [selectedVertexIndex, setSelectedVertexIndex] = useState(-1);

//   const movePolygon = (e) => {
//     if (isSelecting && selectedPolygonIndex !== -1) {
//       const mouseX = e.clientX - canvasLeft + window.scrollX;
//       const mouseY = e.clientY - canvasRight + window.scrollY;

//       const deltaX = mouseX - canvasLeft;
//       const deltaY = mouseY - canvasRight;

//       const updatedPolygon = workplaces[selectedPolygonIndex].points.map((point) => ({
//         x: point.x + deltaX,
//         y: point.y + deltaY,
//       }));

//       setWorkplaces((prevWorkplaces) => {
//         const newWorkplaces = [...prevWorkplaces];
//         newWorkplaces[selectedPolygonIndex] = {
//           ...newWorkplaces[selectedPolygonIndex],
//           points: updatedPolygon,
//         };
//         return newWorkplaces;
//       });

//       renderWorkplaces();
//     }
//   };

//   const moveVertex = (e) => {
//     const canvas = canvasRef.current;
//     const canvasLeft = canvas.getBoundingClientRect().left + window.scrollX;
//     const canvasTop = canvas.getBoundingClientRect().top + window.scrollY;

//     const mouseX = e.clientX - canvasLeft;
//     const mouseY = e.clientY - canvasTop;

//     if (selectedPolygonIndex !== -1 && selectedVertexIndex !== -1) {
//       const newWorkplaces = [...workplaces];
//       const selectedPolygon = newWorkplaces[selectedPolygonIndex];
//       const selectedVertex = selectedPolygon.points[selectedVertexIndex];

//       selectedVertex.x = mouseX;
//       selectedVertex.y = mouseY;

//       setWorkplaces(newWorkplaces);
//       renderWorkplaces();
//     }
//   };

//   const handleDrawMode = () => {
//      const canvas = canvasRef.current;
//     setIsDrawing((prevIsDrawing) => !prevIsDrawing);

//     if (!isDrawing) {
//       console.log("Entering Drawing Mode");
//       setDrawModeBtnText("Exit Drawing Mode");
//       setSelectModeBtnDisabled(true);
//       setSelectModeBtnText("Enter Select Mode");
//       setIsSelecting(false);
//       setSelectModeBtnBackgroundColor("");
//       canvas.removeEventListener("mouseup", movePolygon);
//       canvas.removeEventListener("mousemove", moveVertex);
//       canvas.removeEventListener("mouseup", stopMovingVertex);
//     } else {

//       setDrawModeBtnText("Enter Drawing Mode");
//       setSelectModeBtnDisabled(false);
//     }
//   };

//   const stopMovingVertex = () => {
//     canvasRef.current.removeEventListener("mousemove", moveVertex);
//     canvasRef.current.removeEventListener("mouseup", stopMovingVertex);
//   };

//   const handleSelectMode = () => {
//     const canvas = canvasRef.current;
//     setIsSelecting((prevIsSelecting) => !prevIsSelecting);

//     if (!isSelecting) {
//       setSelectModeBtnText("Exit Select Mode");
//       setDrawModeBtnDisabled(true);
//       setDrawModeBtnText("Enter Drawing Mode");
//       setIsDrawing(false);
//       setSelectModeBtnBackgroundColor("");
//       canvas.removeEventListener("mouseup", movePolygon);
//       canvas.removeEventListener("mousemove", moveVertex);
//       canvas.removeEventListener("mouseup", stopMovingVertex);
//     } else {
//       setSelectModeBtnText("Enter Select Mode");
//       setDrawModeBtnDisabled(false);
//     }
//   };

//   const handleDone = () => {
//     setWorkplaces((prevWorkplaces) => [
//       ...prevWorkplaces,
//       {
//         points: clickPoints,
//         desc: descInput,
//       },
//     ]);
//     console.log(workplaces);
//     setClickPoints([]);
//     setDescInput("");
//     renderWorkplaces();
//   };

//   const handleCancel = () => {
//     setClickPoints([]);
//     renderWorkplaces();
//   };

//   const undo = () => {
//     if (clickPoints.length > 0) {
//       const newClickPoints = [...clickPoints];
//       newClickPoints.pop();
//       setClickPoints(newClickPoints);
//       renderWorkplaces();
//       drawInsertedPolygon();
//       drawInsertedPoints();
//     }
//   };

//   const handleDelete = () => {
//     if (isSelecting && selectedPolygonIndex !== -1) {
//       setWorkplaces((prevWorkplaces) => {
//         const newWorkplaces = [...prevWorkplaces];
//         newWorkplaces.splice(selectedPolygonIndex, 1);
//         return newWorkplaces;
//       });
//     }
//     setSelectedPolygonIndex(-1);
//     setDeleteBtnDisabled(true);
//     renderWorkplaces();
//   };

//   const handleSaveClick = () => {
//     if (workplaces.length > 0 && workplaces[0].points.length > 0) {
//       updatePolygons();
//     } else {
//       console.log("No data to save.");
//     }
//   };

//   useEffect(() => {
//     async function fetchData()  {
//       try {
//         const response = await fetch(`http://localhost:3000/cameraAPI/api/camera/${cameraID}`);
//         if (response.status === 403) {
//           const errorMessage = await response.json();
//           alert(errorMessage);
//           return;
//         } else {
//           const data = await response.json();
//           setCamera(data[0]);
//           setImageSrc(data[0].video);

//         }
//       } catch (error) {
//         console.error("Error fetching data:", error);
//       }
//     }
//     fetchData();

//   }, [cameraID]);

//   const loadAndDrawImage = useCallback(async () => {
//     const canvas = canvasRef.current;

//     if (!canvas  ) {
//       console.error("Canvas reference   is not available.");
//       return;
//   }else{
//     console.log("work");
//     console.log("isDrowing? ", isDrawing);
//   }
//   if ( !camera.video) {
//     console.error(" camera video is not available.");
//     return;
// }

//     console.log(canvas);
//     console.log(canvasRef.current);

//     if (!canvas) {
//       console.error("Canvas reference is not available.");
//       return;
//     }

//     const ctx = canvas.getContext("2d");
//      // Ensure that camera.video is defined before attempting to load the image

//      if (!camera.video) {
//         console.error("Camera video is not available.");
//       return;
//      }

//       try {
//         const image = await loadImage(camera.video);
//         // canvas.width = image.width;
//         // canvas.height = image.height;
//          canvas.width = 580;
//          canvas.height = 350;
//         ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

//         var canvasLeft = canvas.getBoundingClientRect().left;
//         var canvasRight = canvas.getBoundingClientRect().top;

//         canvas.style.backgroundImage = `url("${camera.video}")`;
//         canvas.style.backgroundSize = "cover";
//         canvas.style.backgroundRepeat = "no-repeat";
//         canvas.style.backgroundPosition = "center";

//         canvas.addEventListener("mousedown", (e) => {
//           const mouseX = e.clientX - canvasLeft + window.scrollX;
//           const mouseY = e.clientY - canvasRight + window.scrollY;

//           if (isDrawing) {
//             setClickPoints((prevClickPoints) => [
//               ...prevClickPoints,
//               { x: Math.round(mouseX), y: Math.round(mouseY) },
//             ]);
//             console.log(clickPoints);
//             renderWorkplaces();
//             drawInsertedPolygon();
//             drawInsertedPoints();
//           } else if (isSelecting) {
//             const selectedPolygonIndex = getSelectedPolygonIndex(mouseX, mouseY);
//             setSelectedPolygonIndex(selectedPolygonIndex);
//             if (selectedPolygonIndex !== -1) {
//               setDeleteBtnDisabled(false);
//               setSelectModeBtnText("Exit Select Mode");
//             } else {
//               setSelectModeBtnText("Enter Select Mode");
//             }
//           }
//         });

//         const drawPoly = (points, isSelected) => {
//           ctx.lineWidth = isSelected ? 7 : 5;
//           ctx.beginPath();
//           ctx.moveTo(points[0].x, points[0].y);
//           points.slice(1).forEach((point) => {
//             ctx.lineTo(point.x, point.y);
//           });
//           ctx.closePath();
//           ctx.stroke();
//         };

//         const renderWorkplaces = () => {
//           ctx.clearRect(0, 0, canvas.width, canvas.height);
//           workplaces.forEach((workplace, index) => {
//             if (workplace.points.length > 2) {
//               const isSelected = index === selectedPolygonIndex;
//               drawPoly(workplace.points, isSelected);
//             }
//           });
//         };

//         const drawDot = (x, y) => {
//           ctx.beginPath();
//           ctx.arc(x, y, 4, 0, Math.PI * 2);
//           ctx.fillStyle = "red";
//           ctx.fill();
//           //ctx.closePath();
//         };

//         const drawInsertedPoints = () => {
//           clickPoints.forEach((point) => {
//             drawDot(point.x, point.y);
//           });
//         };

//         const drawInsertedPolygon = () => {
//           if (clickPoints.length > 2) {
//             drawPoly(clickPoints);
//           }
//         };

//         // const updatePolygons = () => {

//         //   console.log("Polygons updated:", workplaces);
//         // };

//         const getSelectedPolygonIndex = (x, y) => {
//           // Loop through workplaces array
//           for (let i = 0; i < workplaces.length; i++) {
//             const polygon = workplaces[i].points;

//             // Check if the point (x, y) is inside the current polygon
//             if (isPointInPolygon(x, y, polygon)) {
//               return i; // Return the index of the selected polygon
//             }
//           }

//           return -1; // Return -1 if no polygon is selected
//         };

//       } catch (error) {
//         console.error("Error loading image:", error);
//       }

//   }, [cameraID, camera.video, clickPoints, workplaces, isDrawing, isSelecting, selectedPolygonIndex]);

//   useEffect(() => {
//     loadAndDrawImage();
//   }, [loadAndDrawImage]);

//   return (
//         <div className="vid-container">
//           {user && (
//             <div className="background">
//               <h3 className="cam-item">Location: {camera.location}</h3>
//               <h4 className="cam-item">Junction: {camera.junction}</h4>
//               {imageSrc && (
//                 <div>
//                    <div style={{ display: "flex", margin: "10px 0" }}>
//                    {/* <canvas ref={canvasRef}></canvas> */}

//                      {/* <input
//                         type="text"
//                         id="polygonDesc"
//                         placeholder="desc"
//                         value={descInput}
//                         onChange={(e) => setDescInput(e.target.value)}
//                       /> */}
//                   </div>
//                   <button onClick={handleDrawMode} disabled={drawModeBtnDisabled}>
//                     {drawModeBtnText}
//                   </button>
//                  <button onClick={handleSelectMode} disabled={selectModeBtnDisabled}>
//                  {selectModeBtnText}
//                  </button>
//           <button onClick={handleDone}>Done</button>
//           <button onClick={handleCancel}>Cancel</button>
//           <button onClick={undo}>Undo</button>
//           <button onClick={handleDelete} disabled={deleteBtnDisabled}>
//             Delete
//           </button>
//           <button onClick={handleSaveClick}>Save</button>
//                    <br />
//                    <canvas ref={canvasRef} style={{ border: "1px solid black" }}></canvas>

//                </div>
//               )}
//             </div>
//           )}
//         </div>
//       );
// };

// export default VideoAnalysis;
