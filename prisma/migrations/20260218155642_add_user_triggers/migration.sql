-- Trigger: User AFTER UPDATE
CREATE TRIGGER trg_user_unified_update
AFTER UPDATE ON User
FOR EACH ROW
BEGIN
    IF OLD.Status = 'A' AND NEW.Status = 'I' THEN
        INSERT INTO Audit (User_ID, Date_Created, Message_Type_ID, Message)
        VALUES (NEW.User_ID, NOW(), 2, 'User deactivated');

    ELSEIF OLD.Status = 'I' AND NEW.Status = 'A' THEN
        INSERT INTO Audit (User_ID, Date_Created, Message_Type_ID, Message)
        VALUES (NEW.User_ID, NOW(), 1, 'User created');

    ELSE
        INSERT INTO Audit (User_ID, Date_Created, Message_Type_ID, Message)
        VALUES (NEW.User_ID, NOW(), 3, 'User updated');
    END IF;
END;

-- Trigger: User AFTER INSERT
CREATE TRIGGER trg_user_after_insert
AFTER INSERT ON User
FOR EACH ROW
BEGIN
    INSERT INTO Audit (User_ID, Date_Created, Message_Type_ID, Message)
    VALUES (NEW.User_ID, NOW(), 1, 'User created');
END;
