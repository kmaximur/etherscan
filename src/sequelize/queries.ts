const getMaxAddress = `
    with "t1" as (
        (select "from" as "address", sum(-("value")) as "sum" from "Transactions" group by "from")
        union all
        (select "to" as "address", sum("value") as "sum" from "Transactions" group by "to")
    )
    select "address", abs(sum("sum")) as "sumAbs" from "t1" group by "address" order by "sumAbs" desc limit 1;
`


export {getMaxAddress}