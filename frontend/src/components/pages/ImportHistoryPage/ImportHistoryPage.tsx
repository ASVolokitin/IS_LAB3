import { useEntities } from "../../../hooks/useEntities";
import { importTableColumns } from "../../../interfaces/dataRepresentation/importTableColumns";
import { ImportHistoryItem } from "../../../interfaces/ImportHistoryItem";
import { devLog } from "../../../services/logger";
import { renderCell } from "../../../services/tableUtils";
import { ImportHistoryTable } from "../../elements/ImportTable/ImportHistoryTable";
import NavBar from "../../elements/NavBar/NavBar"

export const ImportHistoryPage = () => {

    const hookedEntities = useEntities<ImportHistoryItem>("import_history").entities;

    return (
        <>
            <NavBar />
            <ImportHistoryTable imports={hookedEntities}/>
        </>
    )
}