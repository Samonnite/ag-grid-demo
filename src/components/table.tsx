import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import { AgGridReact } from "ag-grid-react"; // the AG Grid React Component
import "ag-grid-enterprise";
import { LicenseManager } from "ag-grid-enterprise";

import "ag-grid-community/styles/ag-grid.css"; // Core grid CSS, always needed
import "ag-grid-community/styles/ag-theme-alpine.css"; // Optional theme CSS

LicenseManager.setLicenseKey(
  "key"
);
const ColorCellRenderer = (props) => {
  const ARROW_UP = "\u2191";
  const ARROW_DOWN = "\u2193";
  const [lastValue, setLastValue] = useState(0);
  useEffect(() => {
    return () => setLastValue(props.value);
  }, [props.value]);

  return (
    <span
      style={{
        borderRadius: props.borderRadius,
        padding: props.padding,
        background:
          lastValue > props.value
            ? "rgba(70,227,114,.1)"
            : "rgba(255,0,92,.19)",
        color: lastValue > props.value ? "#46e372" : "#ff005c",
      }}
    >
      {lastValue > props.value
        ? ARROW_DOWN + props.value
        : ARROW_UP + props.value}
    </span>
  );
};
const AgTable = () => {
  const UPDATE_COUNT = 50;
  let nextTradeId = 24287;
  const gridRef = useRef(); // Optional - for accessing Grid's API
  const [rowData, setRowData] = useState<any>([]); // Set rowData to Array of Objects, one Object per Row

  const numberCellFormatter = (params: any) => {
    return Math.floor(params.value)
      .toString()
      .replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
  };

  // Each Column Definition results in one Column.
  const [columnDefs, setColumnDefs] = useState([
    // these are the row groups, so they are all hidden (they are show in the group column)
    { headerName: "ID", field: "trade", width: 160, rowDrag: true },

    // all the other columns (visible and not grouped)
    {
      headerName: "income",
      field: "current",
      width: 200,
      aggFunc: "sum",
      enableValue: true,
      cellClass: "number",
      valueFormatter: numberCellFormatter,
      // cellRenderer: "agAnimateShowChangeCellRenderer",
      cellRenderer: ColorCellRenderer,
      // sort: "desc",
      cellRendererParams: {
        borderRadius: "20px",
        padding: " 5px 12px",
      },
    },
    {
      headerName: "Previous",
      field: "previous",
      width: 200,
      aggFunc: "sum",
      enableValue: true,
      cellClass: "number",
      valueFormatter: numberCellFormatter,
      cellRenderer: "agAnimateShowChangeCellRenderer",
      // cellRendererParams: {
      //   borderRadius: "20px",
      //   padding: " 5px 12px",
      // },
    },
    {
      headerName: "Deal Type",
      field: "dealType",
      enableRowGroup: true,
      enablePivot: true,
    },
    {
      headerName: "line",
      field: "pl1",
      width: 200,
      aggFunc: "sum",
      enableValue: true,
      cellClass: "number",
      cellRenderer: "agSparklineCellRenderer",
      cellRendererParams: {
        sparklineOptions: {
          type: "column",
          fill: "#91cc75",
          stroke: "#91cc75",
          highlightStyle: {
            fill: "orange",
          },
          paddingInner: 0.3,
          paddingOuter: 0.1,
        },
      },
    },
    {
      headerName: "Bid",
      field: "bidFlag",
      enableRowGroup: true,
      enablePivot: true,
      width: 100,
    },
    {
      headerName: "PL 2",
      field: "pl2",
      width: 200,
      aggFunc: "sum",
      enableValue: true,
      cellClass: "number",
      valueFormatter: numberCellFormatter,
      cellRenderer: "agAnimateSlideCellRenderer",
    },
    {
      headerName: "Gain-DX",
      field: "gainDx",
      width: 200,
      aggFunc: "sum",
      enableValue: true,
      cellClass: "number",
      valueFormatter: numberCellFormatter,
      cellRenderer: "agAnimateShowChangeCellRenderer",
    },
    {
      headerName: "SX / PX",
      field: "sxPx",
      width: 200,
      aggFunc: "sum",
      enableValue: true,
      cellClass: "number",
      valueFormatter: numberCellFormatter,
      cellRenderer: "agAnimateSlideCellRenderer",
    },
    {
      headerName: "99 Out",
      field: "_99Out",
      width: 200,
      aggFunc: "sum",
      enableValue: true,
      cellClass: "number",
      valueFormatter: numberCellFormatter,
      cellRenderer: "agAnimateShowChangeCellRenderer",
    },
    {
      headerName: "Submitter ID",
      field: "submitterID",
      width: 200,
      aggFunc: "sum",
      enableValue: true,
      cellClass: "number",
      valueFormatter: numberCellFormatter,
      cellRenderer: "agAnimateShowChangeCellRenderer",
    },
    {
      headerName: "Submitted Deal ID",
      field: "submitterDealID",
      width: 200,
      aggFunc: "sum",
      enableValue: true,
      cellClass: "number",
      valueFormatter: numberCellFormatter,
      cellRenderer: "agAnimateShowChangeCellRenderer",
    },
  ]);

  const getRowId = useMemo(() => {
    return ({ data }) => data.trade;
  }, []);

  const createTradeId = () => {
    nextTradeId++;
    return nextTradeId;
  };

  const createTradeRecord = () => {
    var current = Math.floor(Math.random() * 100000) + 100;
    var previous = current + Math.floor(Math.random() * 10000) - 2000;
    var trade = {
      trade: createTradeId(),
      submitterID: randomBetween(10, 1000),
      submitterDealID: randomBetween(10, 1000),
      dealType: Math.random() < 0.2 ? "Physical" : "Financial",
      bidFlag: Math.random() < 0.5 ? "Buy" : "Sell",
      current: current,
      previous: previous,
      pl1: Array.from({ length: 10 }, () => randomBetween(100, 1000)),
      pl2: randomBetween(100, 1000),
      gainDx: randomBetween(100, 1000),
      sxPx: randomBetween(100, 1000),
      _99Out: randomBetween(100, 1000),
    };
    return trade;
  };

  const randomBetween = (min: number, max: number) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  const copyObject = (object: any) => {
    // start with new object
    var newObject: any = {};

    // copy in the old values
    Object.keys(object).forEach(function (key) {
      newObject[key] = object[key];
    });

    return newObject;
  };

  const startFeed = () => {
    setInterval(() => {
      let updatedIndexes: any = {};
      var newItems = [];
      for (var i = 0; i < UPDATE_COUNT; i++) {
        // pick one index at random

        var index = Math.floor(Math.random() * rowData.length);

        // dont do same index twice, otherwise two updates for same row in one transaction
        if (updatedIndexes[index]) {
          continue;
        }
        var itemToUpdate = rowData[index];
        var newItem = copyObject(itemToUpdate);
        // copy previous to current value
        newItem.previous = newItem.current;
        // then create new current value
        newItem.current = Math.floor(Math.random() * 100000) + 100;
        newItem.pl1 = Array.from({ length: 10 }, () =>
          randomBetween(100, 1000)
        );
        newItem.dealType=Math.random() < 0.2 ? "Physical" : "Financial";
        newItem.bidFlag=Math.random() < 0.5 ? "Buy" : "Sell";
        newItem.pl2=randomBetween(100, 1000);
        newItem.gainDx= randomBetween(100, 1000);
        newItem.sxPx= randomBetween(100, 1000);
        newItem._99Out= randomBetween(100, 1000);
        newItems.push(newItem);
      }
      gridRef.current!.api.applyTransaction({ update: newItems });
    }, 500);
  };

  // DefaultColDef sets props common to all Columns
  const defaultColDef = useMemo(
    () => ({
      sortable: true,
      resizable: true,
    }),
    []
  );

  // Example of consuming Grid Event
  const cellClickedListener = useCallback((event) => {
    console.log("cellClicked", event);
  }, []);

  const createRowData = () => {
    const data = [];
    for (let i = 0; i < 100; i++) {
      const trade = createTradeRecord();
      data.push(trade);
    }
    setRowData(data);
  };

  // Example load data from sever
  useEffect(() => {
    // fetch("./monthlySales.json")
    //   .then((result) => result.json())
    //   .then((rowData) => {
    //     setRowData(rowData);
    //   });
    createRowData();
  }, []);

  useEffect(() => {
    if (rowData.length) {
      startFeed();
    }
  }, [rowData]);

  return (
    <div>
      {/* On div wrapping Grid a) specify theme CSS Class Class and b) sets Grid size */}
      <div
        className="ag-theme-alpine-dark"
        style={{ width: "100vw", height: "100vh" }}
      >
        <AgGridReact
          ref={gridRef} // Ref for accessing Grid's API
          rowDragManaged={true}
          rowData={rowData} // Row Data for Rows
          columnDefs={columnDefs} // Column Defs for Columns
          defaultColDef={defaultColDef} // Default Column Properties
          animateRows={true} // Optional - set to 'true' to have rows animate when sorted
          rowSelection="multiple" // Options - allows click selection of rows
          getRowId={getRowId}
          deltaSort={true}
          onCellClicked={cellClickedListener} // Optional - registering for Grid Event
        />
      </div>
    </div>
  );
};

export default AgTable;
