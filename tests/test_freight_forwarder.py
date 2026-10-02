import sys
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import Select

URL = "https://omcouriers.com/admin"
USERNAME = "ratnakar nayak"
PASSWORD = "ratnakar@123"

def run_freight_forwarder_booking():
    print("=====================================================")
    print("✈️ Freight Forwarder Automated AWB Booking Test")
    print(f"URL: {URL}")
    print("=====================================================\n")

    options = webdriver.ChromeOptions()
    # options.add_argument("--headless") # Keep browser visible to see form filling live!
    
    try:
        driver = webdriver.Chrome(options=options)
        driver.maximize_window()
    except Exception as e:
        print("❌ Error launching ChromeDriver:", e)
        print("💡 Install required packages: pip install selenium webdriver-manager")
        return

    wait = WebDriverWait(driver, 15)

    try:
        # 1. Login
        print("1️⃣ Logging into Admin Portal...")
        driver.get(URL)
        time.sleep(2)

        user_input = wait.until(EC.presence_of_element_located((By.XPATH, "//input[@placeholder='Enter username']")))
        user_input.clear()
        user_input.send_keys(USERNAME)

        pass_input = driver.find_element(By.XPATH, "//input[@placeholder='••••••••']")
        pass_input.clear()
        pass_input.send_keys(PASSWORD)

        login_btn = driver.find_element(By.XPATH, "//button[contains(text(), 'Sign In')]")
        login_btn.click()
        time.sleep(3)

        # 2. Navigate to Add Shipment Form
        print("2️⃣ Navigating to Add Shipment Form...")
        try:
            add_shipment_btn = wait.until(EC.element_to_be_clickable((By.XPATH, "//*[contains(text(), 'Add Shipment') or contains(text(), 'Shipment')]")))
            add_shipment_btn.click()
            time.sleep(2)
        except Exception as nav_err:
            print("Already on shipment form or navigate failed:", nav_err)

        # 3. Fill AWB Details
        print("3️⃣ Filling Air Waybill Details...")
        
        # Payment Mode -> CREDIT
        try:
            pay_mode = Select(driver.find_element(By.NAME, "payment_mode"))
            pay_mode.select_by_value("CREDIT")
            print("   Selected Payment Mode: CREDIT")
        except Exception:
            pass

        # Type -> INTERNATIONAL
        try:
            type_select = Select(driver.find_element(By.NAME, "shipment_type_field"))
            type_select.select_by_value("international")
            print("   Selected Type: INTERNATIONAL")
            time.sleep(1)
        except Exception:
            pass

        # Product -> NON-DOC
        try:
            prod_select = Select(driver.find_element(By.NAME, "product"))
            prod_select.select_by_visible_text("NON-DOC")
            print("   Selected Product: NON-DOC")
            time.sleep(1)
        except Exception:
            pass

        # Ref No
        try:
            ref_input = driver.find_element(By.NAME, "ref_no")
            ref_input.clear()
            ref_input.send_keys("FWD-EXP-2026-8891")
            print("   Entered Reference No: FWD-EXP-2026-8891")
        except Exception:
            pass

        # Shipment Value & Currency
        try:
            val_input = driver.find_element(By.NAME, "shipment_value")
            val_input.clear()
            val_input.send_keys("2500")
            print("   Entered Value: 2500")
        except Exception:
            pass

        # 4. Fill Shipper (Consignor) Information
        print("\n4️⃣ Filling Shipper (Consignor) Information...")
        shipper_fields = {
            "shipper_company": "Global Freight Solutions Pvt Ltd",
            "shipper_name": "Rajesh Sharma",
            "shipper_address1": "Plot 42, MIDC Industrial Area, Wagle Estate",
            "shipper_address2": "Phase II",
            "shipper_zip": "400604",
            "shipper_city": "Thane",
            "shipper_state": "Maharashtra",
            "shipper_phone": "9820123456",
            "shipper_email": "exports@globalfreight.com",
            "shipper_kyc_no": "27AADCG1234F1Z9"
        }

        for field_name, value in shipper_fields.items():
            try:
                inp = driver.find_element(By.NAME, field_name)
                inp.clear()
                inp.send_keys(value)
                print(f"   Filled {field_name}: {value}")
            except Exception as e:
                pass

        # 5. Fill Consignee (Receiver) Information
        print("\n5️⃣ Filling Consignee (Receiver) Information...")
        consignee_fields = {
            "consignee_company": "Apex Freight Supply Chain LLC",
            "consignee_name": "John Miller",
            "consignee_address1": "1200 Market Street, Suite 400",
            "consignee_address2": "Building B",
            "consignee_zip": "90210",
            "consignee_city": "Los Angeles",
            "consignee_state": "California",
            "consignee_country": "UNITED STATES",
            "consignee_phone": "3105550199",
            "consignee_email": "imports@apexfreight.com"
        }

        for field_name, value in consignee_fields.items():
            try:
                inp = driver.find_element(By.NAME, field_name)
                inp.clear()
                inp.send_keys(value)
                print(f"   Filled {field_name}: {value}")
            except Exception as e:
                pass

        print("\n🎉 Freight Forwarder Form successfully populated in Chrome!")
        print("⏸️ Pausing browser for 15 seconds so you can see the filled form on screen...")
        time.sleep(15)

    except Exception as err:
        print("\n❌ Form Population Error:", err)
    finally:
        driver.quit()

if __name__ == "__main__":
    run_freight_forwarder_booking()
