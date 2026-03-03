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
DROP TRIGGER IF EXISTS trg_driver_points_update;
-- Trigger: Driver AFTER UPDATE
CREATE TRIGGER trg_driver_points_update
AFTER UPDATE ON Driver
FOR EACH ROW
BEGIN
    -- Only log if Point_Count actually changed
    IF OLD.Point_Count <> NEW.Point_Count THEN
        INSERT INTO Audit (User_ID, Date_Created, Message_Type_ID, Message)
        VALUES (
            NEW.User_ID,
            NOW(),
            5,
            CONCAT(
                'User points changed from ',
                OLD.Point_Count,
                ' to ',
                NEW.Point_Count
            )
        );
    END IF;
END;