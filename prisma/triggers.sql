-- Delete the old trigger
DROP TRIGGER IF EXISTS trg_user_unified_update;
-- Trigger: User AFTER UPDATE
CREATE TRIGGER trg_user_unified_update
AFTER UPDATE ON User
FOR EACH ROW
BEGIN
    -- Active → Deactivated (A → D)
    IF OLD.Status = 'A' AND NEW.Status = 'D' THEN
        INSERT INTO Audit (User_ID, Date_Created, Message_Type_ID, Message)
        VALUES (NEW.User_ID, NOW(), 2, 'User deactivated');

    -- Deactivated → Active (D → A)
    ELSEIF OLD.Status = 'D' AND NEW.Status = 'A' THEN
        INSERT INTO Audit (User_ID, Date_Created, Message_Type_ID, Message)
        VALUES (NEW.User_ID, NOW(), 1, 'User created');

    -- Any other change
    ELSE
        INSERT INTO Audit (User_ID, Date_Created, Message_Type_ID, Message)
        VALUES (NEW.User_ID, NOW(), 3, 'User updated');
    END IF;
END;

-- Delete the old trigger
DROP TRIGGER IF EXISTS trg_user_after_insert;
-- Trigger: User AFTER INSERT
CREATE TRIGGER trg_user_after_insert
AFTER INSERT ON User
FOR EACH ROW
BEGIN
    INSERT INTO Audit (User_ID, Date_Created, Message_Type_ID, Message)
    VALUES (NEW.User_ID, NOW(), 1, 'User created');
END;

-- Delete the old trigger
DROP TRIGGER IF EXISTS trg_driver_sponsor_org_points_update;

-- Delete the old trigger
DROP TRIGGER IF EXISTS trg_sponsor_point_value_update;
-- Trigger: Sponsor_Org AFTER UPDATE (for point value changes)
CREATE TRIGGER trg_sponsor_point_value_update
AFTER UPDATE ON Sponsor_Org
FOR EACH ROW
BEGIN
    IF OLD.Point_Dollar_Value <> NEW.Point_Dollar_Value THEN
        INSERT INTO Audit (User_ID, Date_Created, Message_Type_ID, Message)
        VALUES (
            @current_user_id,
            NOW(),
            6,
            CONCAT(
                'Conversion rate changed from ',
                OLD.Point_Dollar_Value,
                ' to ',
                NEW.Point_Dollar_Value
            )
        );
    END IF;
END;

-- Delete the old trigger
DROP TRIGGER IF EXISTS trg_purchase_after_insert;
-- Trigger: Purchase AFTER INSERT
CREATE TRIGGER trg_purchase_after_insert
AFTER INSERT ON Point_Transaction
FOR EACH ROW
BEGIN
    INSERT INTO Audit (User_ID, Date_Created, Message_Type_ID, Message)
    VALUES (
        NEW.User_ID,
        NOW(),
        7,
        CONCAT(
            'User purchased a ',
            NEW.Price,
            ' point item: ',
            (SELECT Item_Name FROM Catalog_Item WHERE Item_ID = NEW.Item_ID)
        )
    );
END;

-- Delete the old trigger
DROP TRIGGER IF EXISTS trg_driver_application_after_insert;
-- Trigger: Driver_Application AFTER INSERT
CREATE TRIGGER trg_driver_application_after_insert
AFTER INSERT ON Driver_Application
FOR EACH ROW
BEGIN
    INSERT INTO Audit (User_ID, Date_Created, Message_Type_ID, Message)
    VALUES (
        NEW.User_ID,
        NOW(),
        8,
        CONCAT(
            'Driver application created for ',
            (SELECT Org_Name FROM Sponsor_Org WHERE Org_ID = NEW.Org_ID)
        )
    );
END;

-- Delete the old trigger
DROP TRIGGER IF EXISTS trg_driver_application_after_update;
-- Trigger: Driver_Application AFTER UPDATE
CREATE TRIGGER trg_driver_application_after_update
AFTER UPDATE ON Driver_Application
FOR EACH ROW
BEGIN
    -- Only log if Status changed
    IF OLD.Status <> NEW.Status THEN
        -- Approved (P → A)
        IF OLD.Status = 'P' AND NEW.Status = 'A' THEN
            INSERT INTO Audit (User_ID, Date_Created, Message_Type_ID, Message)
            VALUES (
                NEW.User_ID,
                NOW(),
                9,
                CONCAT(
                    'Driver application approved for ',
                    (SELECT Org_Name FROM Sponsor_Org WHERE Org_ID = NEW.Org_ID)
                )
            );
        -- Rejected (P → R or A → R)
        ELSEIF NEW.Status = 'R' THEN
            INSERT INTO Audit (User_ID, Date_Created, Message_Type_ID, Message)
            VALUES (
                NEW.User_ID,
                NOW(),
                10,
                CONCAT(
                    'Driver application rejected for ',
                    (SELECT Org_Name FROM Sponsor_Org WHERE Org_ID = NEW.Org_ID)
                )
            );
        END IF;
    END IF;
END;