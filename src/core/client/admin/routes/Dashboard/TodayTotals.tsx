import { Localized } from "@fluent/react/compat";
import { isNumber } from "lodash";
import React, { FunctionComponent, useEffect, useState } from "react";
import { Environment } from "relay-runtime";

import {
  BansTodayJSON,
  CommentsTodayJSON,
  RejectedTodayJSON,
  SignupsTodayJSON,
} from "coral-common/rest/dashboard/types";
import { createFetch, useFetch } from "coral-framework/lib/relay";
import { Table, TableBody, TableCell, TableRow } from "coral-ui/components/v2";
import styles from "./TodayTotals.css";

const TodayTotalsFetch = createFetch(
  "todayTotalsFetch",
  async (environment: Environment, variables: any, { rest }) => {
    const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const url = `/dashboard/${
      variables.siteID ? variables.siteID + "/" : ""
    }/comments/today?tz=${zone}`;
    return rest.fetch<CommentsTodayJSON>(url, {
      method: "GET",
    });
  }
);

const TodayNewCommentersFetch = createFetch(
  "newCommentersFetch",
  async (environment: Environment, variables: any, { rest }) => {
    const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const url = `/dashboard/${
      variables.siteID ? variables.siteID + "/" : ""
    }signups/today?tz=${zone}`;
    return rest.fetch<SignupsTodayJSON>(url, {
      method: "GET",
    });
  }
);

const TodayBansFetch = createFetch(
  "todayBansFetch",
  async (environment: Environment, variables: any, { rest }) => {
    const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const url = `/dashboard/${
      variables.siteID ? variables.siteID + "/" : ""
    }bans/today?tz=${zone}`;
    return rest.fetch<BansTodayJSON>(url, {
      method: "GET",
    });
  }
);

const TodayRejectedFetch = createFetch(
  "todayRejectedFetch",
  async (environment: Environment, variables: any, { rest }) => {
    const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const url = `/dashboard/${
      variables.siteID ? variables.siteID + "/" : ""
    }rejected/today?tz=${zone}`;
    return rest.fetch<RejectedTodayJSON>(url, {
      method: "GET",
    });
  }
);

interface Props {
  ssoRegistrationEnabled: boolean;
  siteID?: string;
}

const TodayTotals: FunctionComponent<Props> = (props) => {
  const todayTotalsFetch = useFetch(TodayTotalsFetch);
  const newComentersFetch = useFetch(TodayNewCommentersFetch);
  const bansFetch = useFetch(TodayBansFetch);
  const rejectedFetch = useFetch(TodayRejectedFetch);
  const [totalComents, setTotalComments] = useState<number | null>(null);
  const [bans, setBans] = useState<number | null>(null);
  const [rejected, setRejected] = useState<number | null>(null);
  const [totalStaffComents, setTotalStaffComments] = useState<number | null>(
    null
  );
  const [newCommenters, setNewCommenters] = useState<number | null>(null);
  useEffect(() => {
    async function getTotals() {
      const todayTotals = await todayTotalsFetch({ siteID: props.siteID });
      setTotalComments(todayTotals.comments.count);
      setTotalStaffComments(todayTotals.comments.byAuthorRole.staff.count);
      if (!props.ssoRegistrationEnabled) {
        const newCommenterResp = await newComentersFetch({
          siteID: props.siteID,
        });
        setNewCommenters(newCommenterResp.signups.count);
      }
      const bansResp = await bansFetch({ siteID: props.siteID });
      setBans(bansResp.banned.count);
      const rejectedResp = await rejectedFetch({ siteID: props.siteID });
      setRejected(rejectedResp.rejected.count);
    }
    getTotals();
  }, []);
  return (
    <div>
      <Localized id="dashboard-today-heading">
        <h3 className={styles.heading}>Today</h3>
      </Localized>
      <Table>
        <TableBody>
          {isNumber(totalComents) && (
            <TableRow>
              <Localized id="dashboard-today-table-total-comments">
                <TableCell>Total comments</TableCell>
              </Localized>
              <TableCell>{totalComents}</TableCell>
            </TableRow>
          )}
          {isNumber(totalStaffComents) && (
            <TableRow>
              <Localized id="dashboard-today-table-total-staff-comments">
                <TableCell>Staff comments</TableCell>
              </Localized>
              <TableCell>{totalStaffComents}</TableCell>
            </TableRow>
          )}
          {isNumber(newCommenters) && (
            <TableRow>
              <Localized id="dashboard-today-table-new-commenters">
                <TableCell>New commenters</TableCell>
              </Localized>
              <TableCell>{newCommenters}</TableCell>
            </TableRow>
          )}
          {isNumber(bans) && (
            <TableRow>
              <Localized id="dashboard-today-table-new-commenters">
                <TableCell>User bans</TableCell>
              </Localized>
              <TableCell>{bans}</TableCell>
            </TableRow>
          )}
          {isNumber(rejected) && (
            <TableRow>
              <Localized id="dashboard-today-table-new-commenters">
                <TableCell>Rejected comments</TableCell>
              </Localized>
              <TableCell>{rejected}</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default TodayTotals;
