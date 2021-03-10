/* eslint-disable */
import { EarnLimitLogicLockData } from "../type";

/**
 * diff数组和新数据，并选择是否插入或修改已有数据
 *
 * @param oldArray
 * @param data
 */
export const diffAndInsertArray = (
  oldArray: EarnLimitLogicLockData[],
  data: EarnLimitLogicLockData
) => {
  const oldClone: EarnLimitLogicLockData[] = JSON.parse(
    JSON.stringify(oldArray)
  );
  const dataClone: EarnLimitLogicLockData = JSON.parse(JSON.stringify(data));
  const isUserExisted = oldClone.some(item => item.userId === dataClone.userId);
  if (isUserExisted) {
    const index = oldClone.findIndex(item => item.userId === dataClone.userId);
    oldClone[index] = dataClone;
  } else {
    oldClone.push(dataClone);
  }
  return oldClone;
};
