import SQL from "sql-template-strings";
import { StandardCase } from "../utils/format.util.js";

export const getOrganizationByName = async (client, name) => {
  try {
    const query = SQL`select * from organizations where name = ${name}`;
    const organizationData = (await client.query(query)).rows;

    if (organizationData.length > 0) {
      return organizationData[0];
    } else {
      return null;
    }
  } catch (error) {
    throw error;
  }
};

export const createOrganization = async (client, name, size, countryCode, countryName, planName, billingPattern) => {
  try {
    // create new organization
    const newOrganizationQuery = SQL`insert into organizations (name, size, country_code, country_name) values(${StandardCase(
      name
    )}, ${size}, ${countryCode}, ${countryName}) returning *`;
    const newOrganization = await client.query(newOrganizationQuery);
    const organizationId = newOrganization.rows[0].id;

    // get plan data
    const planQuery = SQL`select id from available_plans where name = ${planName}`;
    const planData = await client.query(planQuery);

    if (planData.rows.length === 0) {
      throw new Error("Failed to get plan details with name");
    }

    const planId = planData.rows[0].id;
    const planAmount = planData.rows[0].price;

    // get tax details
    const taxPercentage =
      Number((await client.query(`select * from company_constants where name='taxable_percentage'`)).rows[0]?.taxable_percentage) || 0;
    console.log("taxPercentage:", taxPercentage);

    // calculate the final amount
    const finalAmount = Number(planAmount) * (1 + Number(taxPercentage) / 100);

    // insert plan record
    const newPlanQuery = SQL`insert into organization_plan (plan_id, organization_id, billing_pattern, tax_percentage, final_amount) values (${planId}, ${organizationId}, ${billingPattern}, ${taxPercentage}, ${finalAmount})`;
    const newPlanResponse = await client.query(newPlanQuery);

    return newOrganization.rows[0];
  } catch (error) {
    throw error;
  }
};
