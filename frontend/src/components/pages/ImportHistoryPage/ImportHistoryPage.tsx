import { useEffect, useState } from "react";
import { useEntities } from "../../../hooks/useEntities";
import { ImportHistoryTable } from "../../elements/ImportTable/ImportHistoryTable";
import NavBar from "../../elements/NavBar/NavBar"
import { ImportHistoryItem } from "../../../interfaces/ImportHistoryItem";
import { PageNav } from "../../elements/PageNav/PageNav";
import "./ImportHistoryPage.css";


export const ImportHistoryPage = () => {

    const [pageNumber, setPageNumber] = useState<number>(0);
    const [pageSize, setPageSize] = useState<number>(5);
    const [maxPageValue, setMaxPageValue] = useState<number>(0);
    const { entities: hookedEntities, serverError, setServerError, entitiesAmount } = useEntities<ImportHistoryItem>("import_history", pageNumber, pageSize);

    const handlePageChange = (page: number) => {
        const minPageValue = 0;
        setPageNumber(Math.max(Math.min(page, maxPageValue), minPageValue));
    };

    useEffect(() => {
        setMaxPageValue(
            Math.floor(
                hookedEntities
                    ? entitiesAmount / pageSize -
                    Number(!Boolean(entitiesAmount % pageSize))
                    : 0
            )
        );
    }, [hookedEntities, pageSize]);

    return (
        <>
            <NavBar />
            <ImportHistoryTable imports={hookedEntities} />
            <PageNav page={pageNumber} size={pageSize} onPageChange={handlePageChange} entitiesAmount={entitiesAmount} />
        </>
    )
}