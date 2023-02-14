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

LicenseManager.setLicenseKey(import.meta.env.VITE_LICENSE_KEY);
const ColorCellRenderer = (props: any) => {
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
      {lastValue < props.value
        ?  "-" +props.value
        : props.value}
    </span>
  );
};
const AgTable = () => {
  const UPDATE_COUNT = 100;
  const DATA_COUNT = 500;
  let nextTradeId = 310820;
  const gridRef = useRef<any>(); // Optional - for accessing Grid's API
  const [rowData, setRowData] = useState<any>([]); // Set rowData to Array of Objects, one Object per Row

  const numberCellFormatter = (params: any) => {
    return Math.floor(params.value)
      .toString()
      .replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
  };

  // Each Column Definition results in one Column.
  const [columnDefs, setColumnDefs] = useState([
    // these are the row groups, so they are all hidden (they are show in the group column)
    { headerName: "用户", field: "trade", width: 160, rowDrag: true, headerCheckboxSelection: true,checkboxSelection: true, },

    // all the other columns (visible and not grouped)
    {
      headerName: "订单号",
      field: "previous",
      width: 200,
      aggFunc: "sum",
      enableValue: true,
    },
    {
      headerName: "交易品种",
      field: "dealType",
      enableRowGroup: true,
      enablePivot: true,
    },
    {
      headerName: "持仓手数",
      field: "bidFlag",
      enableRowGroup: true,
      enablePivot: true,
      width: 150,
    },
    {
      headerName: "开仓价",
      field: "pl2",
      width: 200,
      aggFunc: "sum",
      enableValue: true,
    },
    {
      headerName: "开仓方向",
      field: "bidFlag2",
      enableRowGroup: true,
      enablePivot: true,
      width: 140,
    },
    {
      headerName: "保证金",
      field: "sxPx",
      width: 180,
      aggFunc: "sum",
      enableValue: true,
    },
    {
      headerName: "收益",
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
      headerName: "收益率",
      field: "current2",
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
      headerName: "跟单",
      field: "gainDx",
      width: 200,
      aggFunc: "sum",
      enableValue: true,
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
    return ({ data }: any) => data.trade;
  }, []);

  const createTradeId = () => {
    nextTradeId++;
    return nextTradeId;
  };

  const createTradeRecord = () => {
    var current = Math.floor(Math.random() * 100000) + 100;
    var current2 = (Math.random() * 100).toFixed(2) + '%';
    var previous = Math.floor(Math.random() * 1000000000);
    var trade = {
      trade: createTradeId(),
      submitterID: randomBetween(10, 1000),
      submitterDealID: randomBetween(10, 1000),
      dealType: Math.random() < 0.2 ? "BTC/USD" : Math.random() > 0.6 ? "GBP/USD" : "EUR/USD",
      bidFlag: Math.random().toFixed(1),
      bidFlag2: Math.random() < 0.2 ? "做多" : "做空",
      current: current,
      current2,
      previous: previous,
      pl1: Array.from({ length: 10 }, () => randomBetween(100, 1000)),
      pl2: (Math.random() * 100).toFixed(6),
      gainDx: Math.random() < 0.2 ? "是" : "否",
      sxPx: (Math.random() * 10000).toFixed(2),
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
        // then create new current value
        newItem.current = Math.floor(Math.random() * 100000) + 100;
        newItem.current2 = (Math.random() * 100).toFixed(2) + '%';
        newItems.push(newItem);
      }
      (gridRef.current as any).api.applyTransaction({ update: newItems });
    }, 800);
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
  const cellClickedListener = useCallback((event:any) => {
    console.log("cellClicked", event);
  }, []);

  const createRowData = () => {
    const data = [];
    for (let i = 0; i < DATA_COUNT; i++) {
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
