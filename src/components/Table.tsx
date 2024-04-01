import React, { Fragment, useEffect, useState} from "react";
//import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { QueueResponse } from '../domain/Response';
import Card from "@mui/material/Card";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import { makeStyles, createStyles } from '@mui/styles';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import EventIcon from '@mui/icons-material/Event';
import { StaticDatePicker } from '@mui/x-date-pickers/StaticDatePicker';
import { DesktopDatePicker } from '@mui/x-date-pickers/DesktopDatePicker';
import Box from '@mui/material/Box';
import dayjs from 'dayjs';
import { log } from "console";

const times:string[] = ["10.00","11.00","12.00","13.00","14.00","15.00","16.00","17.00","18.00","19.00"];

const useStyles = makeStyles({
  root: {
    width: "100%",
    maxWidth: 500,
    paddingTop: "20%",
    paddingLeft: "80%",
    paddingBottom: "10%",
  },
  isLoading: {
    paddingTop: "10%",
    paddingLeft: "105%",
    paddingBottom: "10%",
  },
});

export default function BasicTable() {

  const classes = useStyles();

  const [queues, setQueues] = useState<QueueResponse[]>([]);
  const [date, setDate] = useState<Date>(new Date());
  const [tabledata, setTableData] = useState<QueueResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const onChangeDate = (dateChange: any) => {
    console.log(dateChange);
    setDate(dayjs(dateChange).toDate());
    console.log(date)
  }

  async function fetchQueue(): Promise<QueueResponse[]> {
    setIsLoading(true);
    const response = await fetch('https://qms-api-77ejhpt2zq-as.a.run.app/qms/api/queue/queueListForWeb', {
      method: 'POST',
      headers: {
        'content-type': 'application/json;charset=UTF-8',
        'X-API-KEY': 'adminqmsapikey',
        'Access-Control-Allow-Origin' : '*',
        'Access-Control-Allow-Headers': 'X-Requested-With'
      },
      body: JSON.stringify({
        shopId: 'S001',
        queueDate: date.toISOString().slice(0, 10),
      }),
    });
    const data = await response.json();
    createTableQueue(data);
    return data;
  }

  useEffect(() => {
    fetchQueue().then((data) => setQueues(data));
  }, [date]);

  const createTableQueue = (data : QueueResponse[]) => {
    setIsLoading(true);
    let queueProsess: QueueResponse[] = [];

   for (let index = 0; index < times.length; index++) {
        queueProsess.push({ 
          queueId: times[index].replace('.','') + ('0' + date.getDate()).slice(-2) + ('0' + (date.getMonth()+1)).slice(-2) + date.getFullYear().toString(), 
          queueDate: "", 
          queueTime: times[index], 
          queuePrice: "", 
          queueTimeout: "", 
          employeeId: "", 
          employeeName: "", 
          serviceId: "", 
          statusId: "", 
          shopId: "" 
        });
    };

    for (let i = 0; i < data.length; i++) {
      for (let y = 0; y < queueProsess.length; y++) {
        if (data[i].queueTime === queueProsess[y].queueTime) {
          queueProsess[y] = data[i];
        }
      }
    };

  setTableData(queueProsess);
  setIsLoading(false);
  }
  
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box m={5}>
        <DemoContainer components={['DatePicker']}>
          <DesktopDatePicker
            label="เลือกวันที่"
            format="DD/MM/YYYY"
            value={dayjs(date)}
            onChange={(newValue) => onChangeDate(newValue)}
          />
        </DemoContainer>
      </Box>
    <TableContainer component={Paper}>
      <Table aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell align="center">เวลา</TableCell>
            <TableCell align="center">ช่างเต๋อ</TableCell>
          </TableRow>
        </TableHead>
          {isLoading ? (
           <TableBody>
            <Box m={2} pl={13}>
            <CircularProgress />
            </Box>
            </TableBody>
          ) : (
            <TableBody>
            {tabledata.map((row) => (
              <TableRow
                key={row.queueId}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell align="center" component="th" scope="row">
                  {row.queueTime}
                </TableCell>
                {row.statusId === '01' ? (
                  <TableCell align="center" ><Chip label={'ไม่ว่าง'} color="error" /></TableCell>
                ) : (
                  <TableCell align="center" ><Chip label={'ว่าง'} color="success" /></TableCell>
                )}
                
              </TableRow>
            ))}
            </TableBody>
          )}
      </Table>
    </TableContainer>
    </LocalizationProvider>
  );
}